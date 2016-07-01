;

var BASIC_PROPS = ["x", "y", "width", "height", "rotation", "scaleX", "scaleY", "originX", "originY", "alpha"];

phina.define("phina.novel.Element", {
  superClass: "phina.display.DisplayElement",
  
  elementMap: null,
  
  init: function(type, script) {
    this.superInit();
    if (typeof script == "string") {
      this.script = phina.asset.AssetManager.get(type, script);
    }
    else {
      this.script = script;
    }
    
    this.layers = {
      "base": phina.novel.Layer().addChildTo(this),
      "0": phina.novel.Layer().addChildTo(this),
      "1": phina.novel.Layer().addChildTo(this),
      "2": phina.novel.Layer().addChildTo(this),
      "message0": phina.novel.Layer().addChildTo(this),
      "message1": phina.novel.Layer().addChildTo(this),
    };
    this.taskIndex = 0;
    this.lockFlag = false;
    this.chSpeed = 1;
    this.variables = {};
    this.localVariablesStack = [];
    this.taskStack = [];
    this.endifStack = [];

    this.labelArea = phina.ui.LabelArea({
      text: "",
      width: 430,
      height: 200,
      fill: 'white',
    }).addChildTo(this.layers.message0);
    
    this.labelArea.text = "";
    this.labelArea.origin.set(0, 0);
    
    this.labelArea.x = 20;
    this.labelArea.y = 330;
    this.labelArea.fontSize = 16;
    
    this.elementMap = {};
    this.basePath = "";

    this.set(0);
    
    this.setInteractive(true);
    this.setBoundingType("all");
  },
  
  lock: function() {
    this.lockFlag = true;
    return this;
  },
  
  unlock: function() {
    this.lockFlag = false;
    return this;
  },

  jump: function(tag) {
    var taskIndex = (typeof tag == 'string') ?
      this.script.tagTable[tag] : tag;
    this.set(taskIndex);
    return this;
  },

  call: function(tag) {
    this.localVariablesStack.push(this.activeTask.params);
    this.taskStack.push(this.taskIndex);
    this.jump(tag);
    return this;
  },

  return: function() {
    this.localVariablesStack.pop();
    var index = this.taskStack.pop()+1;
    this.set(index);
  },

  set: function(index) {
    this.taskIndex = index;
    this.activeTask = this.script.tasks[this.taskIndex];
    this.seek = 0;
    
    if (!this.activeTask) {
      var e = phina.event.Event("taskfinish");
      this.fire(e);
      this.flare("finish");
    }
  },
  
  next: function() {
    this.set(this.taskIndex+1);
  },

  finish: function() {
    this.set(this.script.tasks.length);
  },

  format: function(value) {
    if (typeof value !== 'string') return value;
    var temp = value;

    var variables = {}.$extend(this.variables, this.localVariablesStack.last);
    value = value.format(variables);

    if (value.match(/^[+-]?[0-9]*[\.]?[0-9]+$/)) {
      value = Number(value);
    }
    else if (value === "true") {
      value = true;
    }
    else if (value === "false") {
      value = false;
    }

    if (/^[\[\(\{)]/.test(value)) {
      value = JSON.parse(value);
    }

    return value;
  },

  macro: function(name) {
    var macro = this.script.macros[name];
    var i = this.script.tasks.indexOf(macro);
    this.call(i).next();
  },

  setVariable: function(key, value) {
    this.variables[key] = value;
    return this;
  },

  getVariable: function(key) {
    return this.variables[key];
  },

  addNovelElement: function(name, element, layerIndex) {
    if (layerIndex === undefined) layerIndex = 1;
    
    var layer = this.layers[layerIndex];
    layer.addChild(element);
    this.elementMap[name] = element;
    
    return this;
  },
  
  getNovelElement: function(name) {
    var element = this.elementMap[name];
    return element;
  },
  
  removeNovelElement: function(name) {
    var element = this.elementMap[name];
    element.remove();
    
    return this;
  },
  
  updateTask: function(app) {
    if (this.lockFlag == true) return ;
    
    var task = this.activeTask;
    if (!task) return ;

    if (task.type == "text") {
      if (app.frame % this.chSpeed == 0) {
        // 変数展開
        if (this.seek == 0) {
          task.value = this.format(task.value);
        }
        var ch = task.value[this.seek++];
        if (ch !== undefined) {
          this.labelArea.text += ch;
          if (app.pointer.getPointingStart()) {
            for (var i=this.seek,len=task.value.length; i<len; ++i) {
              var ch = task.value[i];
              this.labelArea.text += ch;
            }
            this.next();
          }
        }
        else {
          this.next();
        }
        
        this.flare("textupdate");
      }
    }
    else if (task.type == "tag") {
      // タグ
      var func = phina.novel.Tag.get(task.func);
      var params = {};

      if (func) {
        for (var key in task.params) {
          var param = task.params[key];
          params[key] = this.format(param);
        }
        func.call(this, app, params);

        this.flare("taskrun", {
          task: task,
        });
      }
      // 自作タグ(マクロ)
      else if (this.script.macros[task.func]) {
        this.macro(task.func);
      }
      else {
        console.assert(func, "don't define `{0}`!".format(task.func));
        debugger;
      }
      
      // 次のタスクへ
      this.updateTask(app);
    }
    else {
      alert();
    }
  },
    
  update: function(app) {
    this.updateTask(app);
  },
  
});

