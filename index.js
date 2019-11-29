const fs = require('fs');
const path = require('path');
const babylon = require('babylon');
const { default: traverse } = require('babel-traverse');
const { transformFromAst } = require('babel-core');

const readCode = path => {
    const dependencies = [];
    const context = fs.readFileSync(path, 'utf-8');
    const ast = babylon.parse(context, {
        sourceType: 'module'
    });
    traverse(ast, {
        ImportDeclaration({ node: { source: { value } } }) {
            dependencies.push(value)
        }
    })
    const { code } = transformFromAst(ast, null, {
        presets: ['env']
    });
    return {
        filePath: path, code, dependencies
    }
}


const getEntryDependencies = entry => {
    const entryCode = { relativePath: entry, ...readCode(entry) };
    const allDependencies = [entryCode];
    // 循环深度遍历依赖
    for (let asset of allDependencies) {
        const dirname = path.dirname(asset.filePath);
        asset.dependencies.forEach(relativePath => {
            const absolutePath = path.join(dirname, relativePath)
            if (/\.css/.test(absolutePath)) {
                const context = fs.readFileSync(absolutePath);
                const code = `
                const style = document.createElement('style');
                style.innerHTML = \`${JSON.stringify(context).replace(/\\r\\n/, '')}\`;
                document.head.appendChild(style);
                `
                allDependencies.push({
                    code,
                    relativePath,
                    dependencies: [],
                    filePath: absolutePath,
                });
            } else {
                const child = readCode(absolutePath);
                child.relativePath = relativePath;
                allDependencies.push(child);
            }
        });
    }
    return allDependencies;
}

const renderBundle = (dependencies, entry) => {
    let modules = '';
    // 原模块包装
    dependencies.forEach(d => {
        modules += `'${d.relativePath}':function(module,exports,require){
            ${d.code}
        },`
    });
    modules = `{${modules}}`;

    const bundle = `(function (modules) {
        const require = (moduleId) => {
            const module = {
                exports: {}
            }
            modules[moduleId].call(module.exports, module, module.exports, require);
            return module.exports.default;
        }

        require('${entry}');

    })(${modules})`

    fs.writeFileSync(path.resolve(__dirname, './dist/bundle.js'), bundle);
}


// 测试代码
const entry = './demo/code.js';

const dependencies = getEntryDependencies(entry)

renderBundle(dependencies, entry);