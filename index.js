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

app.use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/awake', (req, res) => res.send("awake"))
  .get('/api', (req, res) => {
    //commandResolver(req.query.command).then(clb => {res.send(clb)});
    res.send(commandResolver(req.query.command,req.query.lang));
  })
  .listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
    try { loadHistory(); callOER(); }
    catch (err) {
    }
  })




function commandResolver(cmdString,lang) {
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
  if(lang == "0") return "I dont know what you mean";
  return "Tak tohle neznám";
}

function showHistory(lang) {
  return rate_data;
}

let rate_data;
async function loadHistory(lang) {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT date_trunc('day',posting_date)::date as date, rate from rate_history;");
    let results = "";
    result.rows.forEach(elelment => {
      let toCrop = elelment.date + " ";
      results = results + toCrop.substring(0,15) + " : " + elelment.rate + "\n"
    })
    //const results = { 'results': (result) ? result.rows : null };
    rate_data = results;
    client.release();
  }
  catch (err) {
    console.log("Cannot connect to DB");
  }
}

function showTime(lang) {
  let date_ob = new Date();
  let hours = date_ob.getHours() +2 ;
  let minutes = date_ob.getMinutes();
  let seconds = date_ob.getSeconds();
  if(lang == "0") return  "Current time is " + hours + ":" + minutes + ":" + seconds + ".";
  return "Momentální čas je " + hours + ":" + minutes + ":" + seconds + ".";
}
showName = (lang) => {
  if(lang == "0") return "My name is ChatBot()";
  return "Moje jméno je ChatBot()";
}


function showRate(lang) {
  let conversion = fx.convert(1, { from: "EUR", to: "CZK" });
  return "1 EURO = " + conversion + "CZK";

}

const jobRefreshRate = scheduler.scheduleJob('30 * * * *', function () { callOER() });

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

module.exports = { showTime, showName, showRate, commandResolver, callOER, loadHistory, showHistory, fx }
