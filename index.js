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

function handleFormSumit() {
  sendMessage({name: $("#name").val(), message: $("#message").val()});
  $("#message").val("");
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
