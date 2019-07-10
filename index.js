const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');

const app = express();

app.set('port', (process.env.PORT || 5000));
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public','favicon.ico')));

app.get('/makescript.user.js', (req, res) => {
  const datas = req.query.datas || '[]'; //JSON.stringify(datas) : string で送られてくる
  const scriptName = req.query.scriptName || 'Twitter UserScript Maker';
  const encodedScriptName = encodeURIComponent(scriptName);
  const date = (new Date()).toISOString().slice(0, 10).replace(/-/g, '.');
  res.set({
    'Content-Type': 'text/plain; charset=utf-8',
    'X-Content-Type-Options': 'nosniff'
  });
  res.render('ejs', { datas, scriptName, encodedScriptName, date });
});

app.listen(app.get('port'), () => {
  console.log('Node app is running at localhost:' + app.get('port'));
});
