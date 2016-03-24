/*
 MIT License http://www.opensource.org/licenses/mit-license.php
 Author Daniel Tschinder @danez
 */
var nextIdent = 0;

function PathChunkPlugin(options) {
  this.chunkName = options.name;
  this.filenameTemplate = options.filename;
  this.test = options.test;
  this.ident = __filename + (nextIdent++);
}

module.exports = PathChunkPlugin;
PathChunkPlugin.prototype.apply = function(compiler) {
  var filenameTemplate = this.filenameTemplate;
  var chunkName = this.chunkName;
  var ident = this.ident;
  var test = this.test;

  var isModuleMatching;
  if (typeof test === 'function') {
    isModuleMatching = test;
  } else if (typeof test === 'string') {
    isModuleMatching = function(userRequest) { return userRequest.indexOf(test) >= 0; };
  } else if (test instanceof RegExp) {
    isModuleMatching = function(userRequest) { return test.test(userRequest); };
  } else {
    throw new Error('Invalid test supplied to path-chunk-webpack-plugin');
  }

  compiler.plugin('compilation', function(compilation) {
    compilation.plugin('optimize-chunks', function(chunks) {
      // only optimize once
      if (compilation[ident]) return;
      compilation[ident] = true;

      var pathChunk = chunks.find(function(chunk) {
        return chunk.name === chunkName;
      });

      if (!pathChunk) {
        pathChunk = this.addChunk(chunkName);
        pathChunk.initial = pathChunk.entry = true;
      }

      var usedChunks = chunks.filter(function(chunk) {
        return chunk !== pathChunk;
      });

      var commonModules = [];
      var addCommonModule = function(module) {
        if (commonModules.indexOf(module) < 0 && module.userRequest && isModuleMatching(module.userRequest)) {
          commonModules.push(module);
        }
      };

      usedChunks.forEach(function(chunk) {
        chunk.modules.forEach(addCommonModule);
        chunk.parents = [pathChunk];
        pathChunk.chunks.push(chunk);
        if (chunk.entry) {
          chunk.entry = false;
        }
      });

      commonModules.forEach(function(module) {
        usedChunks.forEach(module.removeChunk);
        pathChunk.addModule(module);
        module.addChunk(pathChunk);
      });

      if (filenameTemplate) {
        pathChunk.filenameTemplate = filenameTemplate;
      }

      this.restartApplyPlugins();
    });
  });
};
