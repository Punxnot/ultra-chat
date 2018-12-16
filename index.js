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
        handleFormSumit();
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

function addMessage(message) {
  $("#messages").append(`<div class="single-message-container"><h4 class="message-username"> ${message.name} </h4> <p class="message-body">${message.message}</p></div>`);
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

function handleFormSumit() {
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
