;

phina.define("phina.novel.Layer", {
  superClass: "phina.display.DisplayElement",
  
  init: function(script) {
    this.superInit();
    
    this.images = {};
  },
  
  addImage: function(key, sprite) {
    this.images[key] = sprite;
    this.addChild(sprite);
  },
  
  getImage: function(key) {
    return this.images[key];
  },
  
  removeImage: function(key) {
    this.images[key].remove();
    this.images[key] = null;
  },
});
