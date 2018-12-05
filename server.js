// Load environmental variables only in dev mode
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').load();
}

var express = require('express');
var bodyParser = require('body-parser')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');
// var sass = require('node-sass');
// var fs = require('fs');

// sass.render({
//   file: 'scss/styles.scss',
//   outputStyle: 'compressed',
//   outFile: 'styles.css'
// }, (error, result) => {
//   if(!error){
//     // No errors during the compilation, write this result on the disk
//     fs.writeFile('css/styles.css', result.css, function(err) {
//       if(!err){
//         console.log("Successfully compiled styles!");
//       }
//     });
//   }
// })

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

var Message = mongoose.model('Message',{
  name : String,
  message : String
});

var dbUrl = `mongodb://${process.env.DBUSERNAME}:${process.env.DBPASSWORD}@ds125574.mlab.com:25574/chat2`;

app.get('/messages', (req, res) => {
  Message.find({}, (err, messages)=> {
    res.send(messages);
  })
});

app.get('/messages/:user', (req, res) => {
  var user = req.params.user;
  Message.find({name: user}, (err, messages) => {
    res.send(messages);
  });
});

app.post('/messages', (req, res) => {
  var message = new Message(req.body);
  message.save((err) => {
    if(err) {
      sendStatus(500);
    }
    io.emit('message', req.body);
    res.sendStatus(200);
  });
});

io.on('connection', () => {
  console.log('A user is connected');
});

mongoose.connect(dbUrl, (err) => {
  console.log('mongodb connected',err);
});

var server = http.listen(3000, () => {
  console.log('Server is running on port', server.address().port);
});
