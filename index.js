const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const app = express()
const fx = require('money');
const https = require('https');
const scheduler = require('node-schedule');
const { resolveAny } = require('dns');
const { text } = require('express');
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
//const bckend = require('./backend');
const apiKey = "STINPKS20XXII";
/* istanbul ignore next */
app.use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/awake', (req, res) => res.send("awake"))
  .get('/api', (req, res) => {
    //commandResolver(req.query.command).then(clb => {res.send(clb)});
    res.send(commandResolver(req.query.command, req.query.lang));
  })
  .listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
    try { loadHistory(); callOER(); }
    catch (err) {
    }
  })




function commandResolver(cmdString, lang) {
  if (cmdString === '!rate' || cmdString.includes('rate') || cmdString.includes('kurz') || cmdString.includes('euro') || cmdString.includes('EUR')) {

    return showRate(lang);
  }

  if (cmdString === '!hello' || cmdString.includes('jmeno') || cmdString.includes('name') || cmdString.includes('jméno') || cmdString.includes('pozdrav')) {

    return showName(lang);
  }

  if (cmdString === '!time' || cmdString.includes('time') || cmdString.includes('čas') || cmdString.includes('cas') || cmdString.includes('hodiny')) {

    return showTime(lang);
  }

  if (cmdString === '!history' || cmdString.includes('history') || cmdString.includes('kurzu') || cmdString.includes('historie') || cmdString.includes('vývoj')) {
    return showHistory(lang);

  }
  if (cmdString === '!rec' || cmdString.includes('doporučit') || cmdString.includes('nákup') || cmdString.includes('buy') || cmdString.includes('recommend')) {
    return showRecommend(lang);

  }
  if (lang == "0") return "I dont know what you mean";
  return "Tak tohle neznám";
}

function showHistory(lang) {
  return rate_data;
}

let lastDays = [20.0, 20.0, 20.0];
function shiftArray(number) {
  lastDays[0] = lastDays[1];
  lastDays[1] = lastDays[2];
  lastDays[2] = number;
}

let recomend = 0; // 0 - doporucit| 1 - nedoporučit
let avrg = 20.0;
function calcRecomendation() {
  avrg = (parseFloat(lastDays[0]) + parseFloat(lastDays[1]) + parseFloat(lastDays[2])) / 3;
  if ((lastDays[2] - lastDays[1]) > (avrg * 0.1) || (lastDays[0] - lastDays[1]) > (avrg * 0.1)) recomend = 1;

}

function showRecommend(lang){
  return loadRecommend(lang,recomend);

}

function loadRecommend(lang,rec){
  if(lang == "0"){
      if(rec == 0) {return "Recommended! " + buildString()};
        return "Not Recommended! " + buildString();
  }
  if(rec == 0) return "Doporučuji! " + buildString()
  return "Nedoporučuji! " + buildString()
}

function buildString(){
  console.log("AVG " + avrg);
return "AVG: " + avrg +"("+ (avrg*0.1)+")"+ " 3>2: " + (lastDays[2] - lastDays[1]) + " 2>1: " + (lastDays[0] - lastDays[1]);
}

let rate_data;
async function loadHistory(lang) {
  /* istanbul ignore next */
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT date_trunc('day',posting_date)::date as date, rate from rate_history;");
    let results = "";
    result.rows.forEach(elelment => {
      let toCrop = elelment.date + " ";
      results = results + toCrop.substring(4, 10) + " : " + elelment.rate + "|\n";
      shiftArray(elelment.rate);
    })
    //const results = { 'results': (result) ? result.rows : null };
    rate_data = results;
    //client.release();
    calcRecomendation();
  }
  catch (err) {
    console.log("Cannot connect to DB");
    client.release();
  }
}

function showTime(lang) {
  let date_ob = new Date();
  let hours = date_ob.getHours() + 2;
  let minutes = date_ob.getMinutes();
  let seconds = date_ob.getSeconds();
  if (lang == "0") return "Current time is " + hours + ":" + minutes + ":" + seconds + ".";
  return "Momentální čas je " + hours + ":" + minutes + ":" + seconds + ".";
}
showName = (lang) => {
  if (lang == "0") return "My name is ChatBot()";
  return "Moje jméno je ChatBot()";
}




function showRate(lang) {
  let conversion = fx.convert(1, { from: "EUR", to: "CZK" });
  return "1 EURO = " + conversion + "CZK";

}

const jobRefreshRate = scheduler.scheduleJob('30 * * * *', function () { callOER() });
/* istanbul ignore next */
const jobDailyRate = scheduler.scheduleJob('00 06 * * *', async function () {
  try {
    let conversion = fx.convert(1, { from: "EUR", to: "CZK" });
    const client = await pool.connect();
    const result = await client.query("Insert into rate_history(rate) VALUES (" + conversion + ")");
    client.release();
    loadHistory();
  }
  catch (err) {
  }
});



function callOER() {
  let url = "https://openexchangerates.org/api/latest.json?app_id=7a3348c295b6434ba94febe7f57c76f0";
  /* istanbul ignore next */
  try {
    https.get(url, (resp) => {
      let body = "";
      resp.on("data", (chunk) => {
        body += chunk;
      });
      resp.on("end", () => {
        try {
          let json = JSON.parse(body);
          fx.rates = json.rates;
          fx.base = json.base;
          console.log("Called");
        } catch (error) {
          console.error(error.message);
        };
      });

    }).on("error", (error) => {
      console.error(error.message);
    });
  }
  catch (err) { }

}

const jobKeepAwake = scheduler.scheduleJob('*/30 * * * *', function () { https.get("https://stin-backend.herokuapp.com/awake", (resp) => { console.log("keeping awake"); }) });

module.exports = { showTime, showName, showRate, commandResolver, loadRecommend, callOER, loadHistory, showHistory, recomend, fx, showRecommend, buildString, calcRecomendation, calcRecomendation, lastDays, shiftArray }
