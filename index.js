const cool = require('cool-ascii-faces');
const express = require('express');
const session = require('express-session');
const {check, validationResult} = require('express-validator/check');
const path = require('path')
const PORT = process.env.PORT || 5000
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
var bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const https = require('https');

express()
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .use(session({secret: 'ssshhhhh'}))
  .use(express.static(path.join(__dirname, 'public')))
  .use(express.static(path.join(__dirname, '.')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => {res.render('pages/index'); console.log(req.session.user);})
  .get('/chat',(req, res) => {res.render('pages/chat')})
  .get('/dotaz',async (req, res) => {let url = "https://stin-backend.herokuapp.com/api?command=" + req.query.cmd + "&lang="+ req.query.lang + "&apikey=STINPKS20XXII";
  try {
    https.get(url, (resp) => {
      let body = "";
      resp.on("data", (chunk) => {
        body += chunk;
      });
      resp.on("end", () => {
        try {
          console.log(body);
          res.send(body);
        } catch (error) {
          console.error(error.message);
        };
      });

    }).on("error", (error) => {
      console.error(error.message);
    });
  }
  catch (err) { }})
  .get('/regi', (req, res) => {
	//TODO registrace
	const hash = bcrypt.hashSync("user", saltRounds);
	console.log(hash);
   	res.redirect('/');
   })
   .post('/login',[
    check('login').trim().escape(),
    check('pass').trim().escape()
    
  ], async (req, res) => {
     try {
      const client = await pool.connect();
      const result = await client.query("SELECT * FROM test_user where login='" + req.body.login + "'");
      if(!result.rows[0]){res.redirect('/');}
      if(!bcrypt.compareSync(req.body.pass, result.rows[0].pass)){res.redirect('/');}
      client.release();
      req.session.user = result.rows[0].id;
      res.redirect('/db');
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
   })
   .post('/complete',[
    check('taskId').trim().escape()    
  ], async (req, res) => {
     try {
      if(typeof req.session.user == "undefined"){res.redirect('/'); console.log('NoLoggged');}
      else{console.log("Zobraz ukoly");
      const client = await pool.connect();
      const result = await client.query("Update test_ukoly set done=TRUE where id=" + req.body.taskId);
      client.release();
      res.redirect('/db');}
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
   })
    .post('/delete',[
    check('taskId').trim().escape()    
  ], async (req, res) => {
     try {
      if(typeof req.session.user == "undefined"){res.redirect('/'); console.log('NoLoggged');}
      else{console.log("Zobraz ukoly");
      const client = await pool.connect();
      const result = await client.query("DELETE FROM test_ukoly where id=" + req.body.taskId);
      client.release();
      res.redirect('/db');}
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
   })
   .post('/update',[
    check('popis').trim().escape(),
    check('custId').trim().escape()
    
  ], async (req, res) => {
     try {
      if(typeof req.session.user == "undefined"){res.redirect('/'); console.log('NoLoggged');}
      else{
      const client = await pool.connect();
      const result = await client.query("Update test_ukoly set popis='"+req.body.popis+"' where id=" + req.body.custId);
      client.release();
      res.redirect('/db');}
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
   })
  .post('/newTask',[
    check('popis').trim().escape()    
  ], async (req, res) => {
     try {
      if(typeof req.session.user == "undefined"){res.redirect('/'); console.log('NoLoggged');}
      else{
      const popis = req.body.popis;
      const client = await pool.connect();
      const result = await client.query("Insert into test_ukoly (user_id,popis,done) VALUES ("+req.session.user+",'" + popis + "',false)");
      client.release();
      res.redirect('/db');}
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
   })
  .get('/db', async (req, res) => {
    try {
      if(typeof req.session.user == "undefined"){res.redirect('/'); console.log('NoLoggged');}
      else{console.log("Zobraz ukoly");
      const client = await pool.connect();
      const result = await client.query("SELECT * FROM test_ukoly where user_id=" + req.session.user);
      const results = { 'results': (result) ? result.rows : null};
      res.render('pages/db', results );
      client.release();
       }
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))



function checkAwake(){


  let url = "https://stin-backend.herokuapp.com/awake";
  try {
    https.get(url, (resp) => {
      let body = "";
      resp.on("data", (chunk) => {
        body += chunk;
      });
      resp.on("end", () => {
        try {
          console.log(body);
          return body;
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