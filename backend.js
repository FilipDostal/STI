const fx = require('money');
const https = require('https');
const scheduler = require('node-schedule');

function commandResolver(cmdString)  {
    if (cmdString === '!rate' || cmdString.includes('rate') || cmdString.includes('kurz') || cmdString.includes('euro') || cmdString.includes('EUR')) {
  
      return showRate();
    }
  
    if (cmdString === '!hello' || cmdString.includes('jmeno') || cmdString.includes('name') || cmdString.includes('jméno') || cmdString.includes('pozdrav')) {
  
      return showName();
    }
  
    if (cmdString === '!time' || cmdString.includes('time') || cmdString.includes('čas') || cmdString.includes('cas') || cmdString.includes('hodiny')) {
  
      return showTime();
    }
  
    if (cmdString === '!history' || cmdString.includes('history') || cmdString.includes('kurzu') || cmdString.includes('historie') || cmdString.includes('vývoj')) {
  
      return showRate();
    }
    return "<a>Invallid command!</a>";
  }



function showTime() {
    let date_ob = new Date();
  
    // current date
    // adjust 0 before single digit date
    let date = ("0" + date_ob.getDate()).slice(-2);
  
    // current month
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  
    // current year
    let year = date_ob.getFullYear();
  
    // current hours
    let hours = date_ob.getHours();
  
    // current minutes
    let minutes = date_ob.getMinutes();
  
    // current seconds
    let seconds = date_ob.getSeconds();
    return "<h1>Momentální čas je " + hours + ":" + minutes + ":" + seconds + "</h1>";
  }
  showName = () => {

    return "<h1>Moje jméno je ChatBot()</h1>";
  }

 
 function showRate() {
    let conversion = fx.convert(1, { from: "EUR", to: "CZK" });
    return "<h1> 1 EURO = " + conversion + "CZK</h1>";
  
  }
/*
  const ratesJob = scheduler.scheduleJob('30 * * * *', function () {
    let url = "https://openexchangerates.org/api/latest.json?app_id=7a3348c295b6434ba94febe7f57c76f0";

    https.get(url, (resp) => {
      let body = "";
      console.log("Load URL");
      resp.on("data", (chunk) => {
        body += chunk;
        console.log("Load DATA");
      });
      resp.on("end", () => {
        console.log("Parse JSON");
        try {
          let json = JSON.parse(body);
          fx.rates = json.rates;
          fx.base = json.base;
          console.log("PARSE DONE!");
  
        } catch (error) {
          console.error(error.message);
        };
      });
  
    }).on("error", (error) => {
      console.error(error.message);
    });


  });*/
  
  const jobKeepAwake = scheduler.scheduleJob('*/30 * * * *', function () { https.get("https://stin-backend.herokuapp.com/awake", (resp) => { console.log("keeping awake"); }) });

  
  module.exports = {showTime, showName, callExrate,showRate,commandResolver}