var socket = io();
$(() => {
  var pattern = Trianglify({
    width: window.innerWidth,
    height: window.innerHeight
  });

  // Generate random pattern for background
  document.body.style.backgroundImage = 'url(' + pattern.png() + ')';

  $("#message").keyup(function(event) {
    if (event.which == 13) {
      var content = this.value;
      var caret = getCaret(this);
      if(event.shiftKey){
        this.value = content.substring(0, caret - 1) + "\n" + content.substring(caret, content.length);
        event.stopPropagation();
      } else {
        this.value = content.substring(0, caret - 1) + content.substring(caret, content.length);
        handleFormSubmit();
      }
    }
  });

  getMessages();
});

socket.on('message', addSingleMessage);

function addAllMessages(data) {
  data.forEach(addMessage);
  scrollToTheLast();
}

function addSingleMessage(message) {
  addMessage(message);
  scrollToTheLast();
}

function formatDate(dateString) {
  var dt = new Date(dateString);
  var options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
  return dt.toLocaleDateString('ru-RU', options);
}

function addMessage(message) {
  formatDate(message.date);
  message.message = handleLinks(message.message);
  $("#messages").append(`<div class="single-message-container"><h4 class="message-username">${message.name}</h4> <p class="message-body">${message.message}</p><span class="message-date">${formatDate(message.date)}</span><button type="button" onclick="return replyToThis(event);">Ответить</button></div>`);
}

function replyToThis(e) {
  var messageText = e.target.parentElement.querySelector('.message-body').textContent;
  messageText = sanitize(messageText);
  var messageAuthor = e.target.parentElement.querySelector('.message-username').textContent;

  var messageText = messageText.replace(/(\r\n\t|\n|\r\t)/gm,"");
  var arr = messageText.match(/.{1,30}/g);
  var resultText = `> ${messageAuthor}:\n`;
  for (chunk of arr) {
    resultText += `> ${chunk} \n`;
  }
  var textArea = document.getElementById('message');
  textArea.value = resultText;
  textArea.focus();
}

function getMessages() {
  $.get('/messages', (data) => {
    addAllMessages(data);
  })
}

function sendMessage(message) {
  $.post('/messages', message)
}

function scrollToTheLast() {
  var allMessages = document.querySelectorAll(".message-body");
  var lastMessage = allMessages[allMessages.length - 1];
  if (lastMessage) {
    lastMessage.scrollIntoView();
  }
}

function sanitize(string) {
  var output = string.replace(/<script[^>]*?>.*?<\/script>/gi, '').
			 replace(/<[\/\!]*?[^<>]*?>/gi, '').
			 replace(/<style[^>]*?>.*?<\/style>/gi, '').
			 replace(/<![\s\S]*?--[ \t\n\r]*>/gi, '').
       trim();
  return output;
}

function handleLinks(text) {
  var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  var text1 = text.replace(exp, "<a href='$1'>$1</a>");
  var exp2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
  return text1.replace(exp2, '$1<a target="_blank" href="http://$2">$2</a>');
}

function handleFormSubmit() {
  var nameInput = document.getElementById('name');
  var messageInput = document.getElementById('message');
  var sanitizedName = sanitize(nameInput.value);
  var sanitizedMessage = sanitize(messageInput.value);
  if (sanitizedName.length && sanitizedMessage.length) {
    nameInput.classList.remove('error-field');
    messageInput.classList.remove('error-field');
    sendMessage({name: sanitizedName, message: sanitizedMessage});
    messageInput.value = '';
  } else if (!sanitizedName.length) {
    nameInput.classList.add('error-field');
  } else if (!sanitizedMessage.length) {
    messageInput.classList.add('error-field');
  }
}

function getCaret(el) {
  if (el.selectionStart) {
    return el.selectionStart;
  } else if (document.selection) {
    el.focus();
    var r = document.selection.createRange();
    if (r == null) {
      return 0;
    }
    var re = el.createTextRange(), rc = re.duplicate();
    re.moveToBookmark(r.getBookmark());
    rc.setEndPoint('EndToStart', re);
    return rc.text.length;
  }
  return 0;
}
