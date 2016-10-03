var app = require('../app');
var Twit = require('twit');
var CronJob = require("cron").CronJob;
var moment = require('moment');
var request = require('request');

var TwitWrapper = {};


// 認証情報の設定
var T = new Twit({
  consumer_key: app.get('options').key,
  consumer_secret: app.get('options').secret,
  access_token: app.get('options').token,
  access_token_secret: app.get('options').token_secret
});

/**
 * tweetをする関数
 *
 * @param message tweetの内容
 */
exports.tweet = function(message){
  T.post('statuses/update', { status: message }, function(err, data, response) {
    if(err) console.error(err);
    else console.log('Tweet: %s', message);
  });
}


/**
 * tweetに返信する関数
 *
 * @param twt 返信対象のtweetオブジェクト
 * @param message 返信内容
 */
exports.reply = function(twt, message) {
   tweet('@'+twt.user.screen_name+message);
 }


/**
 * twitterのpublicタイムライン上に指定したキーワードを含むtweetがなされた場合に、反応して実行する関数を設定する。
 *
 * @param keywords 監視するキーワード(配列も可)
 * @param callback キーワードを含むtweetが呟かれた際に実行される関数 引数に対象のtweetオブジェクトが渡される
 */
exports.listen = function(keywords, callback) {
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
exports.cron = function(cronJobSetting, callback) {
  return new CronJob({
    cronTime: cronJobSetting,
    onTick: callback,
    start: true
  });
}
