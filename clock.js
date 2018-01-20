const http = require('http');
const Events = require('events');
const eventEmmiter = new Events ();
const open = require("open");


const PORT = process.env.PORT || 3000;
const INTERVAL = process.env.INTERVAL || 1000;
const TIMEOUT = process.env.TIMEOUT || 10000;

eventEmmiter.on('connected', () => {
  console.log("Консоль сказала... стартуееем!");
});


http.createServer(function (request, response) {
  eventEmmiter.emit('connected');

  // Задаем интервал вывода времени/даты UTC
  var timerId = setInterval(() => {
    let date = new Date().toLocaleString();
    response.write(date + '\n');
    console.log(date);
  }, INTERVAL);

  // Объявляем прекращение
  setTimeout(() => {
    clearInterval(timerId);
    console.log("STOP");
    response.end();
  }, TIMEOUT);
}).listen(PORT);


open('http://127.0.0.1:'+PORT);