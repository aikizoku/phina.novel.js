;

(function() {
  phina.novel.Tag.set({

    base: function(app, params) {
      this.basePath = params.path.format(this.variables);
      this.next();
    },
    
    load: function(app, params) {
      this.lock();

      var type = params.type;
      var name = params.name;
      var path = params.path.format(this.variables);
      path = (this.basePath) ? this.basePath + "/" + path : path;
      console.log(path);

      var assets = {}
      assets[name] = path;

      var data = {}
      data[type] = assets;

      var loader = phina.asset.AssetLoader();
      loader.onload = function() {
          this.unlock();
          this.next();
      }.bind(this);
      
      loader.load(data);
    },
  });
})();

