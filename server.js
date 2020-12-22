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

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

var Message = mongoose.model('Message',{
  name : String,
  message : String,
  date: { type: Date, default: Date.now }
});

// var dbUrl = `mongodb://${process.env.DBUSERNAME}:${process.env.DBPASSWORD}@ds125574.mlab.com:25574/chat2`;
// mongodb+srv://ozma:<password>@cluster0.4ec6x.mongodb.net/<dbname>?retryWrites=true&w=majority

// var dbUrl = `mongodb+srv://${process.env.DBUSERNAME}:${process.env.DBPASSWORD}@cluster0.4ec6x.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`;
var dbUrl = `mongodb+srv://ozma:Sonrisa42Palabra66@chat2.cghlp.mongodb.net/chat2?retryWrites=true&w=majority`;

app.get('/messages', (req, res) => {
  Message.find({}, null, {sort: {'_id': 1}}, (err, messages) => {
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
      res.sendStatus(500);
    }
    req.body.date = message.date;
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

var port = process.env.PORT || 3000;

var server = http.listen(port, () => {
  console.log('Server is running on port', server.address().port);
});
