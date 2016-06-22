
/*
 * contant
 */
var SCREEN_WIDTH    = 465;        // スクリーン幅
var SCREEN_HEIGHT   = 465;        // スクリーン高さ
var SCREEN_CENTER_X = SCREEN_WIDTH/2;   // スクリーン幅の半分
var SCREEN_CENTER_Y = SCREEN_HEIGHT/2;  // スクリーン高さの半分

// 最初に読み込むアセット
var ASSETS = {
  ks: {
    'novel': 'novels/test.ks',
  },
};

// phina.jsをグローバル領域に展開
phina.globalize();

/*
 * main
 */
phina.main(function() {
  var app = GameApp({
    startLabel: 'main',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#444',
    assets: ASSETS,
  });
  app.run();
});

/*
 * MainScene
 */
phina.define('MainScene', {
  superClass: 'DisplayScene',
  
  init: function() {
    this.superInit();

    // ノベルを作成
    var novel = 'novel';
    var elm = phina.novel.Element(novel).addChildTo(this);

    // 文字数表示用のラベルを作成
    var label = Label().addChildTo(this);
    label.$extend({
        x: 430,
        y: 420,
        fill: "white",
        fontSize: 24,
    });

    // 文字数が更新されたらラベルに出力
    elm.ontextupdate = function(e) {
      label.text = this.labelArea.text.length;
    };
    
    elm.ontaskrun = function(e) {
      console.log(e.task.func);
    };
    
    elm.onnovelcall = function(e) {
      switch (e.name) {
        case 'recordsound':
          // 録音開始
          console.log('レコード開始');
          break;
      }
    };

    elm.ontaskfinish = function() {
      console.log('finish!');
    };
  },
  
  onext: function() {
    var loader = AssetLoader();
    loader.onload = function() {
      app.replaceScene(NextScene());
    };
    loader.load();
  }
});



