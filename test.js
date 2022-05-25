const { spawn, ChildProcess } = require('child_process');
const got = require('got');
const fx = require('money');
const test = require('tape');
const bckend = require('./index');

const env = Object.assign({}, process.env, {PORT: 5000});
const child = spawn('node', ['index.js'], {env});


test('show name', (t) => {
  t.plan(2);
  t.equal(bckend.showName("1"),"Moje jméno je ChatBot()");
  t.equal(bckend.showName("0"),"My name is ChatBot()");
  t.end();

});

test('string builder', (t) => {
  t.plan(1);
  t.equal(bckend.buildString(),"AVG: 20(2) 3>2: 0 2>1: 0");
  t.end();
});

test('call  recomend', (t) => {
  t.plan(2);
  t.equal(bckend.showRecommend("0"),"Recommended! AVG: 20(2) 3>2: 0 2>1: 0");
  t.equal(bckend.showRecommend("1"),"Doporučuji! AVG: 20(2) 3>2: 0 2>1: 0");
  t.end();
});

test('shifty array', (t) => {
  t.plan(1);
  bckend.shiftArray(20);
  t.equal(bckend.buildString(),"AVG: 20(2) 3>2: 0 2>1: 0");
  t.end();
});

test('show recommend', (t) => {
  t.plan(4);
  t.equal(bckend.loadRecommend("0",0),"Recommended! AVG: 20(2) 3>2: 0 2>1: 0");
  t.equal(bckend.loadRecommend("1",0),"Doporučuji! AVG: 20(2) 3>2: 0 2>1: 0");
  t.equal(bckend.loadRecommend("0",1),"Not Recommended! AVG: 20(2) 3>2: 0 2>1: 0");
  t.equal(bckend.loadRecommend("1",1),"Nedoporučuji! AVG: 20(2) 3>2: 0 2>1: 0");
  t.end();
});

test('load history', (t) => {
  t.plan(1);
  t.notEqual(bckend.loadHistory(),undefined);
  t.end();

});

test('show history', (t) => {
  t.plan(1);
  t.equal(bckend.showHistory("1"),undefined);
  t.end;
});

test('connect to openexchangerate', (t) => {
  t.plan(2);
  bckend.callOER()
  t.notEqual(bckend.fx.rates,null);
  t.notEqual(bckend.fx.base,null);
  t.end();

});

test('show time', (t) => {
  t.plan(2);
  let date_ob = new Date();
  let hours = date_ob.getHours()+2;
  let minutes = date_ob.getMinutes();
  let seconds = date_ob.getSeconds();
  t.equal(bckend.showTime("0"),"Current time is " + hours + ":" + minutes + ":" + seconds + ".");
  t.equal(bckend.showTime("1"),"Momentální čas je " + hours + ":" + minutes + ":" + seconds + ".");
  t.end();
});


test('test command resolver', (t) => {
  t.plan(9);
  t.equal(bckend.commandResolver("!hello","1"),"Moje jméno je ChatBot()");
  t.equal(bckend.commandResolver("!hello","0"),"My name is ChatBot()");

  let date_ob = new Date();
  let hours = date_ob.getHours()+2;
  let minutes = date_ob.getMinutes();
  let seconds = date_ob.getSeconds();
  t.equal(bckend.commandResolver("!time","0"),"Current time is " + hours + ":" + minutes + ":" + seconds + ".");
  t.equal(bckend.commandResolver("!time","1"),"Momentální čas je " + hours + ":" + minutes + ":" + seconds + ".");
  t.throws(function() {bckend.commandResolver("!rate")});
  t.equal(bckend.commandResolver("!history"),undefined);
  t.equal(bckend.commandResolver("asdad","0"),"I dont know what you mean");
  t.equal(bckend.commandResolver("!rec","0"),"Recommended! AVG: 20(2) 3>2: 0 2>1: 0");
  t.equal(bckend.commandResolver("asdad","1"),"Tak tohle neznám");
  t.end();
  child.kill();
});

/*test('terminate', (t) => {
  t.plan(1);
  t.equal(true,true);
  setTimeout(function() {}, 5000);
  process.exit(1);});*/

/*
  test('responds to requests', (t) => {
    t.plan(4);
  
    // Wait until the server is ready
    child.stdout.on('data', _ => {
      // Make a request to our app
      request('http://127.0.0.1:5000', (error, response, body) => {
        // stop the server
        child.kill();
  
        // No error
        t.false(error);
        // Successful response
        t.equal(response.statusCode, 200);
        // Assert content checks
        t.notEqual(body.indexOf("<title>Node.js Getting Started on Heroku</title>"), -1);
        t.notEqual(body.indexOf("Getting Started on Heroku with Node.js"), -1);
      });
    });
  });*/



test.onFinish(() => process.exit(0));
/*
const env = Object.assign({}, process.env, {PORT: 5000});
const child = spawn('node', ['index.js'], {env});

test('responds to requests', (t) => {
  t.plan(4);

  // Wait until the server is ready
  child.stdout.on('data', _ => {
    // Make a request to our app
    request('http://127.0.0.1:5000', (error, response, body) => {
      // stop the server
      child.kill();

      // No error
      t.false(error);
      // Successful response
      t.equal(response.statusCode, 200);
      // Assert content checks
      t.notEqual(body.indexOf("<title>Node.js Getting Started on Heroku</title>"), -1);
      t.notEqual(body.indexOf("Getting Started on Heroku with Node.js"), -1);
    });
  });
});*/

