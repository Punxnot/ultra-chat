$(() => {
  const socket = io();

  const addAllMessages = (data) => {
    if (data && data.length) {
      data.forEach(addMessage);
      scrollToTheLast();
    }
  };

  const addSingleMessage = (message) => {
    addMessage(message);
    scrollToTheLast();
  };

  const formatDate = (dateString) => {
    const dt = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    return dt.toLocaleDateString('ru-RU', options);
  };

  const addMessage = (message) => {
    formatDate(message.date);
    message.message = handleLinks(message.message);
    $("#messages").append(`<div class="single-message-container"><h4 class="message-username">${message.name}</h4> <p class="message-body">${message.message}</p><span class="message-date">${formatDate(message.date)}</span><button type="button" onclick="return replyToThis(event);">Ответить</button></div>`);
  };

  const replyToThis = (e) => {
    let messageText = e.target.parentElement.querySelector('.message-body').textContent;
    messageText = sanitize(messageText);
    messageText = messageText.replace(/(\r\n\t|\n|\r\t)/gm, '');
    const messageAuthor = e.target.parentElement.querySelector('.message-username').textContent;
    const arr = messageText.match(/.{1,30}/g);
    const resultText = `> ${messageAuthor}:\n`;

    for (chunk of arr) {
      resultText += `> ${chunk} \n`;
    }

    const textArea = document.getElementById('message');
    textArea.value = resultText;
    textArea.focus();
  };

  const getMessages = () => {
    $.get('/messages', (data) => {
      addAllMessages(data);
    });
  }

  const sendMessage = (message) => {
    $.post('/messages', message);
  };

  const scrollToTheLast = () => {
    const allMessages = document.querySelectorAll('.message-body');
    const lastMessage = allMessages[allMessages.length - 1];

    if (lastMessage) {
      lastMessage.scrollIntoView();
    }
  };

  const sanitize = (string) => {
    const output = string.replace(/<script[^>]*?>.*?<\/script>/gi, '').
  			 replace(/<[\/\!]*?[^<>]*?>/gi, '').
  			 replace(/<style[^>]*?>.*?<\/style>/gi, '').
  			 replace(/<![\s\S]*?--[ \t\n\r]*>/gi, '').
         trim();
    return output;
  };

  const handleLinks = (text) => {
    const exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    const text1 = text.replace(exp, "<a target='_blank' href='$1'>$1</a>");
    const exp2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    return text1.replace(exp2, '$1<a href="http://$2">$2</a>');
  };

  const handleFormSubmit = () => {
    const nameInput = document.getElementById('name');
    const messageInput = document.getElementById('message');
    const sanitizedName = sanitize(nameInput.value);
    const sanitizedMessage = sanitize(messageInput.value);

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
  };

  const getCaret = (el) => {
    if (el.selectionStart) {
      return el.selectionStart;
    } else if (document.selection) {
      el.focus();
      const r = document.selection.createRange();

      if (r == null) {
        return 0;
      }

      const re = el.createTextRange(), rc = re.duplicate();
      re.moveToBookmark(r.getBookmark());
      rc.setEndPoint('EndToStart', re);
      return rc.text.length;
    }

    return 0;
  };

  const pattern = Trianglify({
    width: window.innerWidth,
    height: window.innerHeight
  });

  // Generate random pattern for background
  document.body.style.backgroundImage = 'url(' + pattern.png() + ')';

  $("#message").keyup((event) => {
    if (event.which == 13) {
      const content = this.value;
      const caret = getCaret(this);
      if (event.shiftKey) {
        this.value = content.substring(0, caret - 1) + '\n' + content.substring(caret, content.length);
        event.stopPropagation();
      } else {
        this.value = content.substring(0, caret - 1) + content.substring(caret, content.length);
        handleFormSubmit();
      }
    }
  });

  getMessages();

  socket.on('message', addSingleMessage);
});
