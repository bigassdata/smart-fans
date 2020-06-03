'use strict';

/**
 * Returns an array of paths (arrays) that have
 * non-Object values.
 * @param {Object} root
 *
 * @example
 * let obj = { a: 1, b: 2, c: { d: 3 }};
 * let paths = getPaths(obj);
 * // => [ [a], [b], [c,d] ]
 */
function getPaths(root) {
    let paths = [];
    let nodes = [{
        obj: root,
        path: []
    }];
    while (nodes.length > 0) {
        let n = nodes.pop();
        Object.keys(n.obj).forEach(k => {
            let path = n.path.concat(k);
            if (n.obj[k] && typeof n.obj[k] === 'object') {
                nodes.unshift({
                    obj: n.obj[k],
                    path: path
                });
            } else {
                paths.push(path);
            }
        });
    }
    return paths;
}

module.exports = getPaths;