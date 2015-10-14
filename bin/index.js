var app = require('../app');
var Twit = require('twit');
var CronJob = require("cron").CronJob;
var moment = require('moment');
var request = require('request');

// 認証情報の設定
var T = new Twit({
  consumer_key: app.get('options').key,
  consumer_secret: app.get('options').secret,
  access_token: app.get('options').token,
  access_token_secret: app.get('options').token_secret
});

/******************************
 *
 * 定時で問題をつぶやく処理の記述
 *
 ******************************/

// 毎時0分にNARUTO、20分にSTAR WARS、40分にONE PIECEの問題をランダムでつぶやく
cron('0 0 * * * *', function(){ getMangaQuestion(1, tweet); });
cron('0 20 * * * *', function(){ getMangaQuestion(2, tweet); });
cron('0 40 * * * *', function(){ etMangaQuestion(3, tweet); });



/**************************************
 *
 * キーワードに反応してつぶやく処理の記述
 *
 **************************************/

var NARUTO_KEYWORDS = ['ナルト展', 'NARUTO展'];
var STARWARS_KEYWORDS = ['スターウォーズ展', 'スター・ウォーズ展', 'STAR WARS展', 'STARWARS展', 'star wars展', 'starwars展', 'Star wars展', 'Star Wars展', 'Starwars展'];
var ONEPIECE_KEYWORDS = ['ウルージ', '今週のワンピ', 'ドンッ', 'クソお世話になりました', '人の夢は終わらね', 'まったくいい人生だった', '好き勝手やりなさる'];
var NARUTO_MESSAGE = ' NARUTO展最高だってばよ！ NARUTOの問題を集めたアプリが公開されているよ！是非試してみてね！ https://goo.gl/IMMgq2'
var STARWARS_MESSAGE = ' STAR WARS展いいですね！ STAR WARSの問題を集めたアプリが公開されています！是非試してみてね！ https://goo.gl/Zod5Mb'
var ONEPIECE_MESSAGE = ' ONE PIECEお好きなんですね！ ONE PIECEの問題を集めたアプリを作ったよ！是非挑戦してみてね！ https://goo.gl/gj6JgZ'

listen(NARUTO_KEYWORDS, function(twt){ reply(twt, NARUTO_MESSAGE); });
listen(STARWARS_KEYWORDS, function(twt){ reply(twt, STARWARS_MESSAGE); });
listen(ONEPIECE_KEYWORDS, function(twt){ reply(twt, ONEPIECE_MESSAGE); });



// 漫画の問題をランダム取得するメソッド
function getMangaQuestion(mangaId, cb) {
  var QUESTIONS_URL = 'http://ec2-52-68-159-188.ap-northeast-1.compute.amazonaws.com/api/v1/questions/';
  request(QUESTIONS_URL+mangaId, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      cb(JSON.parse(body).question_array[0].sentence);
    } else {
      console.log('error: '+ response.statusCode);
    }
  });
};


/*******************************************************************
 *
 * 以下、Tweetに必要な関数をまとめてある
 *
 ******************************************************************/

/**
 * tweetをする関数
 *
 * @param message tweetの内容
 */
function tweet(message){
  T.post('statuses/update', { status: message }, function(err, data, response) {
    console.log('Tweet: %s', message);
  });
}


/**
 * tweetに返信する関数
 *
 * @param twt 返信対象のtweetオブジェクト
 * @param message 返信内容
 */
 function reply(twt, message) {
   tweet('@'+twt.user.screen_name+message);
 }


/**
 * twitterのpublicタイムライン上に指定したキーワードを含むtweetがなされた場合に、反応して実行する関数を設定する。
 *
 * @param keywords 監視するキーワード(配列も可)
 * @param callback キーワードを含むtweetが呟かれた際に実行される関数 引数に対象のtweetオブジェクトが渡される
 */
function listen(keywords, callback) {
  var stream = T.stream('statuses/filter', { track: keywords });
  stream.on('tweet', function (twt) { callback(twt); });
}


/**
 * 関数の定期実行を設定する
 * Twitterの仕様上、同じこと一定間隔以内で2回続けて呟くことができないので注意
 *
 * @param cronJobSetting cronの設定 ex.)平日の毎時30分'0 30 * * * 1-5'
 * @param callback 定期実行される関数
 */
function cron(cronJobSetting, callback) {
  return new CronJob({
    cronTime: cronJobSetting,
    onTick: callback,
    start: true
  });
}
