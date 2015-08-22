'use strict';

var now = new Date();
var month = now.getMonth() + 1;
var day = now.getDate().toString().substring(0, 2);
var minutes = now.getMinutes();
var hours = now.getHours();
var seconds = now.getMilliseconds().toString().substring(0, 2);
var year = now.getFullYear();
if (month < 10) {
  month = '0' + month;
}

if (hours < 10) {
  hours = '0' + hours;
}
var formattedDate = year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;


console.log(formattedDate);

module.exports = {
  ROOT_DIRECTORY: __dirname + '/../../../',
  FORMATTED_TIMESTAMP: formattedDate
};
