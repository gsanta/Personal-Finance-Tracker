const recast = require('recast');
module.exports = function(source) {
  const ast = recast.parse(source);

  recast.visit(ast, {
    visitExportDefaultDeclaration(path) {
      path.replace(`import { renderPageComponent } from '@/utils/reactPage';\nrenderPageComponent(${recast.print(path.node.declaration).code});`);
      return false;
    }
  });

  return recast.print(ast).code;
};
