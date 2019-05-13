var Twit = require('twit')
var yahooFinance = require('yahoo-finance');
 
var T = new Twit({
  consumer_key:         'consumer-key',
  consumer_secret:      'consumer-secret',
  access_token:         'access-token',
  access_token_secret:  'acess-token-secret',
  timeout_ms:           60*1000,
  strictSSL:            true,
})

var stream = T.stream('statuses/filter', { track: '@B3_robot' || '@b3_robot'})

stream.on('tweet', function (tweet) {
  var obj = tweet
  var screenName = obj.user.screen_name

  if (screenName + "" !== `B3_robot`) {
    var text = obj.text
    var tweetId = obj.id_str

    var re = /(\w+)\s(\w+)/;
    var ticker = text.replace(re, '$2')
    var tickerSubstr = ticker.substr(1);
    var concatTicker = tickerSubstr + `.SA`

    yahooFinance.quote({
      symbol: concatTicker,
    }, function (err, quotes) {

      if (err + "" !== "null") {        
        var res = {
          status:  '@' + screenName + ' Para utilizar o bot nos envie apenas o código de negociação. Obrigado!',
          in_reply_to_status_id: '' + tweetId
        };
    
        T.post('statuses/update', res, function(err, data, response) {
            console.log(data);
        });

      } else {
        var price = quotes.price.regularMarketPrice
        var maximum = quotes.price.regularMarketDayHigh
        var minimum = quotes.price.regularMarketDayLow
        var varition = quotes.price.regularMarketChange
        var longName = quotes.price.longName + ""

        if (longName == "null") {
          longName = tickerSubstr.toUpperCase()
        }

        var today = new Date();

        // stock market is closed
        if (today.getDay() == 6 || today.getDay() == 0 || maximum == 0 || minimum == 0) {
          var res = {
            status:  '@' + screenName + ' O preço de ' + longName + " é: R$ " + price + " | Variação: " + varition + "%",
            in_reply_to_status_id: '' + tweetId
          };
        } else {
          var res = {
            status:  '@' + screenName + ' O preço de ' + longName + " é: R$ " + price + " | Máxima/Dia: R$ " + maximum + " Mínimo/Dia: R$ " + minimum + " | Variação: " + varition + "%",
            in_reply_to_status_id: '' + tweetId
          };
        }

        T.post('statuses/update', res, function(err, data, response) {
            console.log(data);
        });
      }
    });
  }
})