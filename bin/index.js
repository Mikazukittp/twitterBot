var request = require('request');
var tw = require('./twitWrapper');

/******************************
 *
 * 定時で問題をつぶやく処理の記述
 *
 ******************************/

// 毎時0分にNARUTO、20分にSTAR WARS、40分にONE PIECEの問題をランダムでつぶやく
tw.cron('0 0 * * * *', function(){ getMangaQuestion(1, tw.tweet); });
tw.cron('0 20 * * * *', function(){ getMangaQuestion(2, tw.tweet); });
tw.cron('0 40 * * * *', function(){ getMangaQuestion(3, tw.tweet); });
tw.cron('0 52 * * * *', function(){ getMangaQuestion(3, tw.tweet); });



/**************************************
 *
 * キーワードに反応してつぶやく処理の記述
 *
 **************************************/

var NARUTO_KEYWORDS = ['ナルト展', 'NARUTO展'];
var STARWARS_KEYWORDS = ['スターウォーズ展', 'スター・ウォーズ展', 'STAR WARS展', 'STARWARS展', 'star wars展', 'starwars展', 'Star wars展', 'Star Wars展', 'Starwars展'];
var ONEPIECE_KEYWORDS = ['ウルージ', '今週のワンピ', 'クソお世話になりました', '人の夢は終わらねぇ', 'まったくいい人生だった', '好き勝手やりなさる'];

var NARUTO_MESSAGE = ' NARUTO展最高だってばよ！ NARUTOの問題を集めたアプリが公開されているよ！是非試してみてね！ https://goo.gl/IMMgq2 https://goo.gl/g020Pw'
var STARWARS_MESSAGE = ' STAR WARS展いいですね！ STAR WARSの問題を集めたアプリが公開されています！是非試してみてね！ https://goo.gl/Zod5Mb https://goo.gl/AsF1lJ'
var ONEPIECE_MESSAGE = ' ONE PIECEお好きなんですね！ ONE PIECEの問題を集めたアプリを作ったよ！是非挑戦してみてね！https://goo.gl/5ZecI3 https://goo.gl/gj6JgZ'

tw.listen(NARUTO_KEYWORDS, function(twt){ tw.reply(twt, NARUTO_MESSAGE); });
tw.listen(STARWARS_KEYWORDS, function(twt){ tw.reply(twt, STARWARS_MESSAGE); });
tw.listen(ONEPIECE_KEYWORDS, function(twt){ tw.reply(twt, ONEPIECE_MESSAGE); });



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
