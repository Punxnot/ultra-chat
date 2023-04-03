// Load environmental variables only in dev mode
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').load();
}

const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

const Message = mongoose.model('Message',{
  name : String,
  message : String,
  date: { type: Date, default: Date.now }
});

const dbUrl = `mongodb+srv://${process.env.DBUSERNAME}:${process.env.DBPASSWORD}@cluster0.4ec6x.mongodb.net/?retryWrites=true&w=majority`;

app.get('/messages', (req, res) => {
  Message.find({}, null, {sort: {'_id': 1}}, (err, messages) => {
    res.send(messages);
  })
});

app.get('/messages/:user', (req, res) => {
  const user = req.params.user;

  Message.find({name: user}, (err, messages) => {
    res.send(messages);
  });
});

app.post('/messages', (req, res) => {
  const message = new Message(req.body);

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
  console.log('mongodb connected', err);
});

const port = process.env.PORT || 3000;

const server = http.listen(port, () => {
  console.log('Server is running on port', server.address().port);
});
