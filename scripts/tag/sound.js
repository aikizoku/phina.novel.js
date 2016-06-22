
;(function() {
	phina.novel.Tag.set({

	  sound_play: function(app, params) {
	      var self = this;
	      var sound = phina.asset.AssetManager.get('sound', params.name);

	      if (params.wait === true) {
	          this.lock();
	          sound.onended = function() {
	              self.unlock();
	              self.next();
	          };
	      }
	      else {
	          this.next();
	      }

	      sound.play();
	  },

	  music_play: function(app, params) {
	      phina.asset.AssetManager.get('sound', params.name).setLoop(true).play();
	      this.next();
	  },

	  music_stop: function(app, params) {
	      phina.asset.AssetManager.get('sound', params.name).stop();
	  },
	});
})();
