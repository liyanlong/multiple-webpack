var glob = require('glob')
var path = require('path')
var config = require('../config')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')

exports.assetsPath = function (_path) {
  var assetsSubDirectory = process.env.NODE_ENV === 'production'
    ? config.build.assetsSubDirectory
    : config.dev.assetsSubDirectory
  return path.posix.join(assetsSubDirectory, _path)
}

exports.cssLoaders = function (options) {
  options = options || {}
  // generate loader string to be used with extract text plugin
  function generateLoaders (loaders) {
    var sourceLoader = loaders.map(function (loader) {
      var extraParamChar
      if (/\?/.test(loader)) {
        loader = loader.replace(/\?/, '-loader?')
        extraParamChar = '&'
      } else {
        loader = loader + '-loader'
        extraParamChar = '?'
      }
      return loader + (options.sourceMap ? extraParamChar + 'sourceMap' : '')
    }).join('!')

    // Extract CSS when that option is specified
    // (which is the case during production build)
    if (options.extract) {
      return ExtractTextPlugin.extract('vue-style-loader', sourceLoader)
    } else {
      return ['vue-style-loader', sourceLoader].join('!')
    }
  }

  // http://vuejs.github.io/vue-loader/en/configurations/extract-css.html
  return {
    css: generateLoaders(['css']),
    postcss: generateLoaders(['css']),
    less: generateLoaders(['css', 'less?importLoaders=2']),
    sass: generateLoaders(['css', 'sass?indentedSyntax']),
    scss: generateLoaders(['css', 'sass']),
    stylus: generateLoaders(['css', 'stylus']),
    styl: generateLoaders(['css', 'stylus'])
  }
}

// Generate loaders for standalone style files (outside of .vue)
exports.styleLoaders = function (options) {
  var output = []
  var loaders = exports.cssLoaders(options)
  for (var extension in loaders) {
    var loader = loaders[extension]
    output.push({
      test: new RegExp('\\.' + extension + '$'),
      loader: loader
    })
  }
  return output
}

exports.getEntry = function (globPath, pathDir) {
  var entries = {},
    files = glob.sync(globPath),
    entry,
    dirname,
    basename,
    pathname,
    extname;

  for (var i = 0; i < files.length; i++) {
    entry = files[i];
    dirname = path.dirname(entry);
    extname = path.extname(entry);
    basename = path.basename(entry, extname);
    pathname = path.normalize(path.join(dirname,  basename));
    pathDir = path.normalize(pathDir);
    if (pathname.startsWith(pathDir)) {
      pathname = pathname.substring(pathDir.length);
    }
    entries[pathname] = [entry];
  }
  return entries;
}

exports.htmlLoaders = function (template, pathDir, webpackEntry) {
  // https://github.com/ampedandwired/html-webpack-plugin
  var pages = exports.getEntry(template, pathDir),
    plugins = [];

  Object.keys(pages).forEach(function(pathname) {

    var conf = {
      filename: path.normalize(pages[pathname][0].replace(template.replace(/\*\*.*$/,''),'')), //生成的html存放路径，相对于path
      template: pages[pathname][0], // html模板路径
      inject: true
    };

    // 是否有对应的入口文件
    if (pathname in webpackEntry) {
      conf.inject = 'body';
      conf.chunks = ['manifest','vendor', pathname];
      conf.hash = true;
      conf.chunksSortMode = 'dependency';
    }
    plugins.push(new HtmlWebpackPlugin(conf));
  });
  return plugins;
}
