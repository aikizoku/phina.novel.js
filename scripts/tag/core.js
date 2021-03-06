;

(function() {
  phina.novel.Tag = {
    map: {},

    get: function(key) {
      return this.map[key];
    },

    set: function(key, fn) {
      if (arguments.length == 1) {
        var obj = arguments[0];
        for (var key in obj) {
          this.map[key] = obj[key];
        }
      }
      else {
        this.map[key] = fn;
      }
      return this;
    },
  };

  phina.novel.Tag.set({
    
    log: function(app, params) {
      var message = params.message || params.msg;
      console.log(message);
      this.next();
    },

    alert: function(app, params) {
      var message = params.message || params.msg;
      alert(message);
      this.next();
    },

    debug: function(app, params) {
      var message = params.message || params.msg;
      console.debug(message);
      debugger;
      this.next();
    },

    // TODO: 削除するかも
    trace: function(app, params) {
      console.log(eval(params.exp));
      this.next();
    },

    var: function(app, params) {
      var value = params.value;

      this.variables[params.key] = value;
      this.next();
    },

    if: function(app, params) {
      var exp = params.exp;
      var rst = eval(exp);

      if (!!rst == true) {
        // endif を探す
        var tasks = this.script.tasks;
        for (var i=this.taskIndex+1,len=tasks.length; i<len; ++i) {
          var task = tasks[i];
          if (task.func == "endif") {
            this.endifStack.push(i);
            break;
          }
        }

        this.next();
      }
      else {
        // endif を探す
        var tasks = this.script.tasks;
        for (var i=this.taskIndex+1,len=tasks.length; i<len; ++i) {
          var task = tasks[i];
          if (task.func == "endif" || task.func == "elseif" || task.func == "else") {
            this.set(i);
            break;
          }
        }
      }
    },

    elseif: function(app, params) {
      if (this.endifStack.last) {
        this.set(this.endifStack.last);
        return;
      }

      var exp = params.exp;
      var rst = eval(exp);

      if (!!rst == true) {
        // endif を探す
        var tasks = this.script.tasks;
        for (var i=this.taskIndex+1,len=tasks.length; i<len; ++i) {
          var task = tasks[i];
          if (task.func == "endif") {
            this.endifStack.push(i);
            break;
          }
        }

        this.next();
      }
      else {
        // endif を探す
        var tasks = this.script.tasks;
        for (var i=this.taskIndex+1,len=tasks.length; i<len; ++i) {
          var task = tasks[i];
          if (task.func == "endif" || task.func == "elseif" || task.func == "else") {
            this.set(i);
            break;
          }
        }
      }
    },

    else: function(app, params) {
      if (this.endifStack.last) {
        this.set(this.endifStack.last);
        return;
      }
      
      this.next();
    },

    endif: function(app, params) {
      this.endifStack.pop();

        this.next();
    },

    macro: function(app, params) {
      // 直近の endmacro を探す
      var tasks = this.script.tasks;
      for (var i=this.taskIndex+1,len=tasks.length; i<len; ++i) {
        var task = tasks[i];
        if (task.func == "endmacro") {
          this.set(i);
          break;
        }
      }
      this.next();
    },

    endmacro: function(app, params) {
      this['return']();
    },

    // 入力待ち
    l: function(app, params) {
      this.lock();
      this.onpointstart = function() {
        this.onpointstart = null;
        
        this.unlock();
        this.next();
      }.bind(this);
    },

    wait: function(app, params) {
      this.lock();
      var wait = phina.accessory.Tweener().attachTo(this);
      wait.clear()
        .wait(params.time)
        .call(function() {
          this.unlock();
          this.next();
        }.bind(this));
    },
    
    delay: function(app, params) {
      this.chSpeed = (params.speed*(app.fps/1000))|0;
      this.chSpeed = Math.max(this.chSpeed, 1);
      this.next();
    },
    
    jump: function(app, params) {
      this.jump(params.target);
    },
    call: function(app, params) {
      this.call(params.target);
    },

    return: function(app, params) {
      this["return"]();
    },

    reload: function(app, params) {
      this.lock();
      this.script.reload();

      this.script.onload = function() {
        this.unlock();
        this.next();
      }.bind(this);
    },
    
    event: function(app, params) {
      params.name = params.name;
      this.flare('novelevent', params);
      this.next();
    },

    s: function(app, params) {
      this.finish();
    },
  });
})();
