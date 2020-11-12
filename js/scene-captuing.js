// jsを記述する際はここに記載していく
/////////////////////////////////
// utility:
// ビジーwaitを使う方法
////////////////////////////////
function sleep(waitMsec) {
    var startMsec = new Date();
    // 指定ミリ秒間だけループさせる（CPUは常にビジー状態）
    while (new Date() - startMsec < waitMsec);
}

function getMyMonsterImage( monster_id, img_type ){
    path_img = "./img/pokemon/"
    // id=0: ポッポ
    if( monster_id == 0){
        if( img_type== "front"){
            path_img = path_img + "poppo.png"
        }else if( img_type== "back" ){
            path_img = path_img + "poppo_behind.png"
        }
    }
    // id=1: イーブイ
    if( monster_id == 1){
        if( img_type== "front"){
            path_img = path_img + "iibui.png"
        }else if( img_type== "back" ){
            path_img = path_img + "iibui_behind.png"
        }
    }
    // id=2: ピカチュウ
    if( monster_id == 2){
        if( img_type== "front"){
            path_img = path_img + "pikachu.png"
        }else if( img_type== "back" ){
            path_img = path_img + "pikachu_behind.png"
        }
    }
    // id=3: ミュウ
    if( monster_id == 3){
        if( img_type== "front"){
            path_img = path_img + "mu.png"
        }else if( img_type== "back" ){
            path_img = path_img + "mu_behind.png"
        }
    }
    return path_img;
}

function getTrainerImage( targ_trainer_id, monster ){
    path_img = "./img/pokemon/";

    // monster = true; でモンスターの画像のパスを返す
    //
    //["虫取り少年", "たんぱんこぞう", "ミニスカート", "カスミ"]
    //["バタフリー", "ラッタ", "ピクシー", "スターミー"]

    //id=0: 虫取り少年
    if( targ_trainer_id == 0 ){
        if( monster == false ){
            path_img = path_img + "mushitori.png";
        }else{
            path_img = path_img + "batafry.png";
        }
    }
    //id=1: 短パンこぞう
    if( targ_trainer_id == 1 ){
        if( monster == false ){
            path_img = path_img + "tanpan.png";
        }else{
            path_img = path_img + "ratta.png";
        }
    }
    //id=2: ミニスカート
    if( targ_trainer_id == 2 ){        
        if( monster == false ){
        path_img = path_img + "miniska.png";
    }else{
        path_img = path_img + "pikcy.png";
    }
    }
    //id=3: カスミ 
    if( targ_trainer_id == 3 ){
        if( monster == false ){
            path_img = path_img + "kasumi.png";
        }else{
            path_img = path_img + "starmey.png";
        }
    }

    return path_img;
}

/////////////////////////////////
// Game Parameters
/////////////////////////////////
// ポケモンの設定
const monster_list = ["ポッポ", "イーブイ", "ピカチュウ", "ミュウ"]
const monster_capturing_difficulty = [0.2, 0.5, 0.5, 0.7]
const monster_lucky = [0.1, 0.4, 0.5, 0.7] //クリティカルヒットの確率
const monster_hp_range = [ [30, 50], [40, 70], [40, 80], [50, 100] ]
const monster_attack_range = [ [10, 20], [15, 25], [15, 30], [20, 40] ]

// 敵ポケモンの設定
const trainer_list = ["虫取り少年", "たんぱんこぞう", "ミニスカート", "カスミ"]
const enemy_monster_list = ["バタフリー", "ラッタ", "ピクシー", "スターミー"]
const enemy_monster_lucky = [0.2, 0.3, 0.5, 0.7] //クリティカルヒットの確率
const enemy_monster_hp_range = [ [30, 50], [30, 40], [40, 80], [50, 100] ]
const enemy_monster_attack_range = [ [10, 20], [20, 25], [15, 30], [20, 30] ]

var player_name = "サトシ";
var r_seed = 0;
var got_pokemon = false;
var targ_monste_id = 0;
var targ_monster = monster_list[targ_monste_id];
var monster_targ_img_path;
var my_monster = null;
var my_monster_archived = null;
let num_of_ball = 5;
var targ_trainer_id = null;
var trainer_img_path = null;
var enemy_monster_img_path = null;

//ポケモンクラス
class Pokemon {
    constructor( name, hp_range, attack_range, lucky) {
        this.name = name;
        this.hp = Math.floor(Math.random()*( hp_range[1]-hp_range[0])+hp_range[0]);
        this.max_hp = this.hp;
        this.attack_range = attack_range;
        this.lucky = lucky;
    }

    getClone(){
        var clone = new Pokemon( "xxx", [0,1], [0,1], 0 );
        clone.name = this.name
        clone.hp = this.hp;
        clone.max_hp = this.max_hp;
        clone.attack_range = this.attack_range;
        clone.lucky = this.lucky;
        return( clone );
    }

    //ポケモンの情報を返す。partで指定した項目のみ取り出すことが可能
    getStatus( part ){
        let stat = "";
        if( part == "name"){
            stat = this.name
        }
        else if( part == "max_hp" ){
            stat = this.max_hp
        }
        else if( part == "hp" ){
            stat = this.hp
        }
        else if( part == "attack" ){
            stat = this.attack_range[0] +  " ~ " + this.attack_range[1]
        }
        else if( part == "lucky" ){
            stat = this.lucky
        }
        else{
            stat = "NAME: " + this.name 
            + "HP: " + this.max_hp
            + " Attack: " + this.attack_range[0] +  " ~ " + this.attack_range[1]   
            + " Lucky: " + this.lucky
        }
        return( stat );
    }

    //攻撃（力）を返す
    //typeは３種類。(type: 命中率, 攻撃力)={(1: 0.8, 低), (2: 0.6, 中), (3: 0.1, 高)}
    getAttckPoint( type ){

        var atk_point = Math.random()*( this.attack_range[1]- this.attack_range[0] )+ this.attack_range[0];
        var p = Math.floor( Math.random()*10 );

            //type1: (命中率, 攻撃力)=(高, 低)
        if( ( type == 1 )&( p > 1 ) ){
            atk_point = Math.floor( atk_point * 0.65 );
        }else if( ( type == 2 )&( p >= 3 ) ){
            //type2: (命中率, 攻撃力)=(中, 中)
            atk_point = Math.floor( atk_point * 1.0 );
        }else if( ( type == 3 )&( p >= 7 ) ){
            //type3: (命中率, 攻撃力)=(低, 高)
            atk_point = Math.floor( atk_point * 1.2 );
        }else{
            atk_point = 0;
        }

        //乱数がlucky値を超えた場合、攻撃力が1.8倍になる
        var pp = Math.random();
        if( pp < this.lucky ){
            atk_point = Math.floor( atk_point * 2 );
        }

        return( atk_point );
    }

    //攻撃を受けてのHPアップデート
    setDamage( damage ){
        this.hp = Math.max( 0, this.hp - damage );
    }
}

//////////////////////////////////////
//  Scene-1
//  捕獲
//////////////////////////////////////

//////////////////////
// スタートボタン
//////////////////////
$(document).on("click", "#capture_start", function(r_seed){

    $("#disp-capture-main").empty("#title");

    document.getElementById("btn_init").disabled = true;

    $("#disp-capture-main").append('<img src="./img/pokemon/capture_start.gif" id="main_img_captutre">')

    //1. 乱数発生（１〜10）
    const r = Math.ceil( Math.random( r_seed )*10 );

    //2. モンスター引き当て
    if( r <= 3 ){
        // 普通キャラ
        targ_monster_id = 1;
    }else if( r >= 9 ){
        // レアキャラ
        targ_monster_id = 2;
    }else if( r <= 5 ){
        // レアキャラ
        targ_monster_id = 3;
    }else{
        // モブキャラ
        targ_monster_id = 0;
    }

    // 出現モンスター確定
    targ_monster = monster_list[ targ_monster_id ];

    //デバグ用
    console.log( targ_monster );
    document.getElementById("capture_start").disabled = true;

    // インタラクション・イベント
    // gif開始5秒後にテキスト出現
    setTimeout( function(){ 
        $("#echo-capture_lower").html("あっ！"
                                    +"<br>"+"やせいの　"+ targ_monster + "　が"
                                    +"<br>"+"とびだしてきた！") }
        , 6000);

    // フィールドgif削除
    setTimeout( function(){ 
        $("#main_img_captutre").remove();}, 4800);
    
    // 関数：敵フェードイン
    // 出現したポケモンの画像
    monster_targ_img_path = getMyMonsterImage( targ_monster_id, "front" );

    setTimeout( function(){
    $("#disp-capture-main").append('<img src=./img/pokemon/player_behind.png id="player_behind">')
    }, 4810 );

    setTimeout( function(){
        $("#disp-capture-main").append('<img src='+ monster_targ_img_path +' id="monster_front">')
    }, 4811 );

    setTimeout( function(){
        document.getElementById("escape").disabled = false;
        //ボールがある場合のみ捕獲ボタンを無効化
        if( num_of_ball > 0 ){
            document.getElementById("try_capture").disabled = false;
            $("#balls_status_message").css("visibility", "visible");
        }
      }, 6100 );
});

//////////////////////
// 捕獲フェーズ
//////////////////////
$(document).on("click", "#try_capture", function(){

    //０. ボールの個数を減らす
    num_of_ball = Math.max( 0, num_of_ball -1 );
    console.log("num_of_balls: "+  num_of_ball);


    $("#echo-capture_lower").html("モンスターボール　を　投げた！");
    $("#balls_status_message").html("のこり　" + num_of_ball + "個");

    //１. 成功確率{0,10} これ以上であれば捕獲成功
    var theta_p = monster_capturing_difficulty[ targ_monster_id ];
    var success = false;

    //２. 乱数発生（0〜1）
    const r = Math.random( r_seed );
    console.log("theta=" + theta_p + "  確率：" + r);

    // ボール投げるアニメーション
    setTimeout( function(){
        $("#disp-capture-main").append('<div id="layer_monsterball"></div>');
        $("#layer_monsterball").append('<img src=./img/pokemon/monsterball.png id="monsterball">');
    }, 500 );

    // モンスターボールエフェクト
    setTimeout( function(){
        $("#layer_monsterball").append('<img src="./img/pokemon/effect_ring.png" id="effect_ring1">');
    }, 1300 );
    setTimeout( function(){
        $("#layer_monsterball").append('<img src="./img/pokemon/effect_ring.png" id="effect_ring2">');
    }, 1400 );

    // ポケモンに当たってポケモンが消える
    setTimeout( function(){
        $("#monster_front").css("animation", "anim-monster-ball-in 1.5s");
    }, 1400 );
    setTimeout( function(){
        $("#monster_front").css("visibility", "hidden");
    }, 1450 );

    // ボールが揺れるアニメーション
    setTimeout( function(){
        $("#effect_ring1").css("visibility", "hidden");
        $("#effect_ring2").css("visibility", "hidden");
        $("#monsterball").css("animation", "rumble 0.8s")
    }, 1600 );
    setTimeout( function(){
        $("#monsterball").css("animation", "rumble2 0.5s")
    }, 2600 );

    //３. 成功判定
    if( r >= theta_p ){

        setTimeout( function(){
            $("#monsterball").css("animation", "rumble 0.8s")
        }, 3400 );

        // ボールを投げてから3秒後
        setTimeout( function(){        
            success = true;
            $("#echo-capture_lower").html("やったー！" + "<br>" + targ_monster + "　を　捕まえた！");
            document.getElementById("try_capture").disabled = true;
            document.getElementById("escape").disabled = true;
            $("#balls_status_message").css("color", "#eaeaea");
    
            //自分のポケモン
            my_monster = new Pokemon( monster_list[ targ_monster_id ]
                , monster_hp_range[ targ_monster_id ]
                , monster_attack_range[ targ_monster_id ]
                , monster_lucky[ targ_monster_id ]);
    
            my_monster_archived = my_monster.getClone();
    
            console.log( my_monster.getStatus("all") );
            
            //リセットボタンが表示される
            document.getElementById("btn_init").disabled = false;

            //Battleが開放される
            document.getElementById("battle_start").disabled = false;
        }
            , 4000 );

        setTimeout( function(){  
            //捕まえたポケモンのステータス表示のため
            //画面をまっさらに
            $("#disp-capture-main").empty();
    
            //ステータス表示領域を新規に追加
            $("#disp-capture-main").append('<div id="my_pokemon_status"></div>')
            //左に画像
            $("#my_pokemon_status").append( '<img src='+ monster_targ_img_path +' id="my_pokemon_status_img">')
            //右にステータスを表示
            $("#my_pokemon_status").append( '<div id="my_pokemon_status_text"></div>')
            $("#my_pokemon_status_text").append( '<text id="my_monster_name">' + my_monster.getStatus("name") + '</text>');
            $("#my_pokemon_status_text").append( "<br>" + "<br>" + "    - HP　　: " + my_monster.getStatus("hp") );
            $("#my_pokemon_status_text").append( "<br>" + "    - 攻撃力: " + my_monster.getStatus("attack") );
            $("#my_pokemon_status_text").append( "<br>" + "    - 幸運　: " + my_monster.getStatus("lucky") );
        }, 5000);

    }else{
        // ボールを投げてから3秒後
        //捕獲失敗
        setTimeout( function(){
            $("#effect_ring1").css("visibility", "visible");
            $("#effect_ring1").css("animation", "monsterball-effect-02 0.4s");
        }, 2850);
        setTimeout( function(){
            $("#monster_front").css("animation", "anim-monster-ball-out 0.3s")
        }, 2910 );

        setTimeout( function(){
            $("#layer_monsterball").empty();
            $("#monster_front").css("visibility", "visible");
        }, 3000 );

        setTimeout( function(){
        $("#echo-capture_lower").html("だめだ！"
        + "<br>" + "モンスターが　ボールから　出てしまった！");

        //ボールが無い場合は捕獲ボタンを無効化
        if( num_of_ball == 0 ){
            document.getElementById("try_capture").disabled = true;
            $("#balls_status_message").css("color", "#eaeaea");
        }
        }, 4000 );

        console.log("num_of_balls: "+  num_of_ball);
    }
});

//////////////////////
//　離脱フェーズ
//////////////////////
$(document).on("click", "#escape", function(){
    console.log("num_of_balls: "+  num_of_ball);
    $("#echo-capture_lower").html("うまく　逃げ切れた！")
    //リセットボタンが表示される
    document.getElementById("btn_init").disabled = false;
    document.getElementById("capture_start").disabled = true;
    document.getElementById("try_capture").disabled = true;
    document.getElementById("escape").disabled = true;
});

//////////////////////
//　初期化
//////////////////////
function initialize(){
    $("#echo-capture_lower").html("");
    $("#echo-capture_lower").html("");
    $("#disp-capture-main").empty();
    num_of_ball = 5;
    console.log("num_of_balls: "+  num_of_ball);
    $("#balls_status_message").html("のこり　5個");
    document.getElementById("capture_start").disabled = false;
    document.getElementById("try_capture").disabled = true;
    document.getElementById("escape").disabled = true;
    document.getElementById("battle_start").disabled = true;
}

$(document).on("click", "#btn_init", initialize );


//////////////////////////////////////
//  Scene-２
//  ポケモンバトル
//////////////////////////////////////

$(document).on("click", "#battle_start", function( r_seed=0 ){

    //ボタン非表示
    activateButtons( activate= false );
    console.log("battle_start");
    $("#disp-battle-main").empty();
    $("#echo-battle_lower").empty();

    // モンスター初期化
    my_monster = my_monster_archived.getClone();
    
    //1. 乱数発生（１〜５）
    const r = Math.ceil( Math.random( r_seed )*10 );

    //2. トレーナー引き当て
    if( r <= 3 ){
        // 普通キャラ
        targ_trainer_id = 1;
    }else if( r >= 9 ){
        // 最強キャラ
        targ_trainer_id = 3;
    }else if( r >= 6 ){
        // 最強キャラ
        targ_trainer_id = 2;
    }else{
        // ザコキャラ
        targ_trainer_id = 0;
    }

    //相手のトレーナー
    enemy_trainer = trainer_list[ targ_trainer_id ];
    trainer_img_path = getTrainerImage( targ_trainer_id, false );
    console.log( enemy_trainer );

    //相手のポケモン
    enemy_monster = new Pokemon( enemy_monster_list[ targ_trainer_id ]
        , enemy_monster_hp_range[ targ_trainer_id ]
        , enemy_monster_attack_range[ targ_trainer_id ]
        , enemy_monster_lucky[ targ_trainer_id ]);
    enemy_monster_img_path = getTrainerImage( targ_trainer_id, true );
    console.log( enemy_monster.getStatus("all") );

    //自分のポケモン
    my_monster_image_path = getMyMonsterImage( targ_monster_id, "back" );

    // 関数：敵フェードイン
    setTimeout( function(){
        $("#disp-battle-main").append('<img src="./img/pokemon/player_behind.png" id="player_behind">');
        $("#disp-battle-main").append('<img src='+ trainer_img_path +' id="trainer_front">');
    }, 1000 );
    setTimeout( function(){
        $("#echo-battle_lower").text( enemy_trainer + "　が　勝負を　仕掛けてきた！");
    }, 2500 );

    // トレーナー退場 → 敵ポケモン登場
    setTimeout( function(){
        $("#trainer_front").css("animation", "anim-trainer-out 0.5s");
    }, 4500);

    setTimeout( function(){
        $("#effect_ring1").css("visibility", "visible");
        $("#effect_ring1").css("animation", "monsterball-effect-02 0.4s");
    }, 4950);

    setTimeout( function(){
        $("#trainer_front").css("visibility", "hidden");
        $("#disp-battle-main").append('<img src='+ enemy_monster_img_path +' id="enemy_monster">');
        $("#echo-battle_lower").append( "<br>" + enemy_trainer + "　は" + enemy_monster.name + "　を　繰り出した！");
    }, 5000);

    // プレーヤー退場
    setTimeout( function(){
        $("#echo-battle_lower").text( "いけっ！　" + my_monster.getStatus("name") + "　！");
        $("#player_behind").css("animation", "anim-player-out 0.3s");
    }, 6000);
    setTimeout( function(){
        $("#player_behind").css("visibility", "hidden");
    }, 6300);

    //自分のポケモン登場
    setTimeout( function(){
        $("#disp-battle-main").append('<img src='+ my_monster_image_path +' id="my_monster_behind">');
        activateButtons( activate=true );
    }, 7000);

    //エフェクト非表示
    //ステータスレイヤー追加
    setTimeout( function(){
        $("#disp-battle-main").append('<div id="layer-effects"></div>')

        $("#layer-effects").append('<img src=./img/pokemon/effect_damage.png id="effect_my_monster_damage">');

        $("#effect_my_monster_damage").css("visibility", "hidden");
    
        $("#layer-effects").append('<img src=./img/pokemon/effect_damage.png id="effect_enemy_monster_damage">');

        $("#effect_enemy_monster_damage").css("visibility", "hidden");

        //ステータスレイヤー
        $("#disp-battle-main").append('<div id="layer-status"><div id="my_status"></div><div id="enemy_status"></div></div>');
    }, 7010 );

    setTimeout( function(){
        //ステータスレイヤー
        $("#my_status").append('<p id="my_hp">HP: '+ my_monster.getStatus("hp") + '　/' + my_monster.getStatus("max_hp") + '</p>');

        $("#my_status").append('<meter max="100" low="30" high="70" optimum="80" value="100" id="my_hp_bar"></meter>');

        $("#enemy_status").append('<p id="enemy_hp">HP: '+ enemy_monster.getStatus("hp") + '　/' + enemy_monster.getStatus("max_hp")+'</p>');

        $("#enemy_status").append('<meter max="100" low="30" high="70" optimum="80" value="100" id="enemy_hp_bar"></meter>');
    }, 7020 );
});


// ステータス表示更新用関数
function updateStatusDisp(){
    let my_max = my_monster.getStatus("max_hp");
    let my_current = my_monster.getStatus("hp");
    let my_hp_ratio = Math.floor( my_current/my_max* 100 );

    let enemy_max = enemy_monster.getStatus("max_hp");
    let enemy_current = enemy_monster.getStatus("hp");
    let enemy_hp_ratio = Math.floor( enemy_current/enemy_max* 100 );

    $("#my_status").html( '<p id="my_hp">HP: '+ my_current + '　/' + my_max + '</p>' + '<meter max="100" low="30" high="70" optimum="80" value=' + String( my_hp_ratio ) + ' id="my_hp_bar"></meter>');

    $("#enemy_status").html( '<p id="enemy_hp">HP: '+ enemy_current + '　/' + enemy_max +'</p>' + '<meter max="100" low="30" high="70" optimum="80" value=' + String( enemy_hp_ratio ) + ' id="enemy_hp_bar"></meter>');

    console.log(my_hp_ratio + " vs " + enemy_hp_ratio )
}

//////////////////////
//　戦闘フェーズ
//////////////////////

function myAttack( type ) {

    console.log("-----myAttack-----")
    //戦闘ボタン非表示
    activateButtons( false );
    //メッセージボックス初期化
    $("#echo-battle_lower").empty();

    $("#echo-battle_lower").html( my_monster.getStatus("name") + "　の　攻撃！");
    var damage_to_enemy = my_monster.getAttckPoint(type);
    enemy_monster.setDamage( damage_to_enemy );
    console.log("damage_to_enemy: " + damage_to_enemy);

    if( damage_to_enemy > 0 ){
        setTimeout( function(){
            $("#my_monster_behind").css("animation", "anim-my-monster-attack-normal 0.3s");
        }, 1000);

        setTimeout( function(){
            // ダメージエフェクト
            $("#effect_enemy_monster_damage").css("visibility", "visible");
        }, 1010);

        setTimeout( function(){
            // ダメージエフェクト
            $("#effect_enemy_monster_damage").css("animation", "damage-effect 0.3s");
        }, 1300);

        setTimeout( function(){             
            $("#enemy_monster").css("animation", "anim-monster-damaged 1s");
            $("#echo-battle_lower").append( "<br>"+ "てきの" + enemy_monster.getStatus("name") + "　は　" + damage_to_enemy + "のダメージを受けた！");
            $("#effect_enemy_monster_damage").css("visibility", "hidden");
        }, 1300);

        setTimeout( function(){             
            $("#effect_enemy_monster_damage").css("visibility", "hidden");
        }, 1400);

        setTimeout( function() { 
            updateStatusDisp();
         }, 2000);
    }else{
        setTimeout( function(){
            $("#echo-battle_lower").append( "<br>" + "だが,　うまく　決まらなかた！");
        }, 2000 );  
    }
}


function enemyAttack() {

    console.log("-----enemyAttack-----")
    //メッセージボックス初期化
    $("#echo-battle_lower").empty();
    //戦闘ボタン非表示
    activateButtons( false );
    $("#echo-battle_lower").append( "てきの" + enemy_monster.getStatus("name") + "　の　攻撃！");

    var damage_to_my_monster = 0;

    var r = Math.ceil( Math.random( r_seed )*3 );
    damage_to_my_monster = enemy_monster.getAttckPoint(r);
    
    console.log("damage_to_my: " + damage_to_my_monster);
    my_monster.setDamage( damage_to_my_monster );

    if( damage_to_my_monster > 0 ){
        setTimeout( function(){
            $("#enemy_monster").css("animation", "anim-enemy-monster-attack-normal 0.3s");
        }, 1000);

        setTimeout( function(){
            //メッセージボックス初期化
            $("#echo-battle_lower").empty();

            // ダメージエフェクト
            $("#effect_my_monster_damage").css("visibility", "visible");
        }, 1000);

        setTimeout( function(){
            
            // ダメージエフェクト
            $("#effect_my_monster_damage").css("animation", "damage-effect 0.3s");

            $("#my_monster_behind").css("animation", "anim-monster-damaged 1s");

            $("#echo-battle_lower").append( "<br>" + my_monster.getStatus("name") + "　は　" + damage_to_my_monster + "のダメージを受けた！");
        }, 1300);

        setTimeout( function(){
            activateButtons( true );
            $("#effect_my_monster_damage").css("visibility", "hidden");
            updateStatusDisp();}
            , 1600 );
    }else{
        setTimeout( function(){
            //メッセージボックス初期化
            $("#echo-battle_lower").empty();
            $("#echo-battle_lower").append( "てきの" + enemy_monster.getStatus("name") + "　の　攻撃は　うまく　決まらなかた！");
            activateButtons( true );
        }, 2000);
    }

    if( my_monster.hp == 0 ){
        setTimeout( function(){
            battle_is_over( winner = "enemy");
            activateButtons( false );
        }, 1000);
    }

    setTimeout( function () {
        //戦闘ボタン表示
        activateButtons( true );
      }, 3000);
}

function battle_is_over( winner ){
    
    updateStatusDisp();

    if( winner== "my" ){
        setTimeout( function(){
            $("#enemy_monster").css("animation", "anim-monster-loose 0.3s");
        }, 300);

        setTimeout( function(){
            //メッセージボックス初期化
            $("#echo-battle_lower").empty();

            $("#enemy_monster").css("visibility", "hidden");
            $("#echo-battle_lower").text( "てきの" + enemy_monster.getStatus("name") + "　は倒れた！");
        }, 1000 );

        setTimeout( function(){
            //メッセージボックス初期化
            $("#echo-battle_lower").empty();
            
            $("#echo-battle_lower").append( "<br>" + enemy_trainer + "　との勝負に勝った！");
            activateButtons( false );
        }, 3000 );

        setTimeout( function(){
            $("#disp-battle-main").append('<img src="./img/pokemon/win-background.png" id="win">');
        }, 5000);

    }else{
        setTimeout( function(){
            $("#my_monster_behind").css("animation", "anim-monster-loose 0.3s");
        }, 500);

        setTimeout( function(){
            //メッセージボックス初期化
            $("#echo-battle_lower").empty();

            $("#my_monster_behind").css("visibility", "hidden");
            $("#echo-battle_lower").html( my_monster.getStatus("name") + "　は倒れた！");
        }, 1500);

        setTimeout( function(){
            $("#echo-battle_lower").append( "<br>" + enemy_trainer + "　との勝負に敗れた...");
            activateButtons( false );
        }, 3000 );

        setTimeout( function(){
            $("#disp-battle-main").append('<img src="./img/pokemon/gameover.png" id="gameover">');
        }, 5000);
    }
}

function activateButtons( activate ) {
    if( activate == true ){
        document.getElementById("btn_attack_type_1").disabled = false;
        document.getElementById("btn_attack_type_2").disabled = false;
        document.getElementById("btn_attack_type_3").disabled = false;
    }else{
        document.getElementById("btn_attack_type_1").disabled = true;
        document.getElementById("btn_attack_type_2").disabled = true;
        document.getElementById("btn_attack_type_3").disabled = true;
    }
}

//-------------------------
// 攻撃 type:1
//-------------------------
$(document).on("click", "#btn_attack_type_1", function(){

    activateButtons( activate= false );

    myAttack(1);

    activateButtons( activate= false );

    setTimeout( function(){
        if( enemy_monster.hp == 0 ){
            setTimeout( function(){
                battle_is_over( winner = "my");
                activateButtons( false );
            }, 500);
        }else{
            enemyAttack();
        }
    }, 4000);
});

//-------------------------
// 攻撃 type:2
//-------------------------
$(document).on("click", "#btn_attack_type_2", function(){
    activateButtons( activate= false );

    myAttack(2);

    activateButtons( activate= false );

    setTimeout( function(){
        if( enemy_monster.hp == 0 ){
            setTimeout( function(){
                battle_is_over( winner = "my");
                activateButtons( false );
            }, 500);
        }else{
            enemyAttack();
        }
    }, 4000);
});

//-------------------------
// 攻撃 type:3
//-------------------------
$(document).on("click", "#btn_attack_type_3", function(){
    
    activateButtons( activate= false );

    myAttack(3);

    activateButtons( activate= false );

    setTimeout( function(){
        if( enemy_monster.hp == 0 ){
            setTimeout( function(){
                battle_is_over( winner = "my");
                activateButtons( false );
            }, 500);
        }else{
            enemyAttack();
        }
    }, 4000);
});