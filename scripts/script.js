;

// 吉里吉里スクリプトの読み込み
phina.asset.AssetLoader.register('ks', function(key, path) {
  var novel = phina.novel.Script(path);
  var flow = novel.load(path);
  return flow;
});

// phina.novel.jsスクリプトの読み込み
phina.asset.AssetLoader.register('novel', function(key, path) {
  var novel = phina.novel.Script(path);
  var flow = novel.load(path);
  return flow;
});

phina.define('phina.novel.Script', {
  superClass: 'phina.asset.Asset',

  init: function() {
    this.superInit();

    this.tasks = [];
    this.tagTable = [];
    this.macros = {};
  },

  _load: function(resolve) {
    var self = this;
    phina.util.Ajax.request({
      responseType: 'text',
      url: this.src,
    })
    .then(function(res) {
      self.extend(res, function(text) {
        self.parse(text);
        resolve(self);
      });
    });
  },

  extend: function(text, fn) {
    var ma = text.match(/[@\[]import path=(.*)/mg);
    if (!ma || ma.length <= 0) {
      fn && fn(text);
      return ;
    }
    var query = this.src.split('?').last;
    var flows = [];
    ma.each(function(task) {
      var flow = phina.util.Flow(function(resolve) {
        var cmd = task.replace(/[@\[\]]/g, '');
        var filename = cmd.match(/path=(.*)/)[1];
        var file = phina.asset.File();
        file.load(filename)
        .then(function(res) {
          text = text.replace(task, res.data);
          resolve(text);
        }.bind(this));
      }.bind(this));
      flows.push(flow);
    }.bind(this));

    phina.util.Flow.all(flows)
    .then(function() {
      fn && fn(text);
    });
  },
  
  parse: function(text) {
    var self = this;
    var tasks = this.tasks;
    var lines = text.split("\n");
    
    lines.each(function(line) {
      line = line.trim();
      var first_char = line[0];
      if (first_char == "*") {
        var key = line.trim();
        var taskIndex = tasks.length;
        self.tagTable[key] = taskIndex;
      }
      else if (first_char == ";" || (line[0] == "/" && line[1] == "/")) {
        // コメント
      }
      else if (first_char == '@') {
        tasks.push( self._makeTag(line.substr(1)) );
      }
      else {
        var tag_flag = false;
        var tag_str = "";
        var text = "";
        
        for (var i=0; i<line.length; ++i) {
          var ch = line[i];
          if (tag_flag == true) {
            if (ch == "]") {
              tasks.push(self._makeTag(tag_str));
              tag_str = "";
              tag_flag = false;
            }
            else {
              tag_str += ch;
            }
          }
          else if (tag_flag == false && ch == "[") {
            if (text != "") {
              tasks.push({
                type: "text",
                value: text.trim()
              });
              text = "";
            }
            tag_flag = true;
          }
          else {
            text+=ch;
          }
        }
        
        if (text != "") {
          tasks.push({
            type: "text",
            value: text.trim()
          });
          text = "";
        }
      }
    });
    
    return this;
  },
  
  _makeTag: function(value) {
    var paramsStr = value.split(' ');
    var func = paramsStr.shift();
    var params = {};
    
    paramsStr.each(function(elm, index) {
      var values = elm.split('=');
      var key = values[0];
      var value = elm.replace(key + '=', '');

      if (value.match(/^[+-]?[0-9]*[\.]?[0-9]+$/)) {
        value = Number(value);
      }
      else if (value === "true") {
        value = true;
      }
      else if (value === "false") {
        value = false;
      }
      // value = JSON.parse('"' + value + '"');
      
      return params[key] = value;
    });
    
    var tag = {
      type: "tag",
      func: func,
      params: params,
    };

    if (func == "macro") {
      this.macros[params.name] = tag;
    }
    
    return tag;
  },
});


