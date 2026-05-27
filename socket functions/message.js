const raceRooms = {};

const RACE_QUOTES = [
  "The quick brown fox jumps over the lazy dog.",
  "Practice typing every day and your speed will improve naturally.",
  "Coding is not about typing fast, but thinking clearly before you type.",
  "A smooth sea never made a skilled sailor.",
  "The only way to do great work is to love what you do.",
  "Success is the sum of small efforts repeated day in and day out.",
  "Focus on progress, not perfection, one keystroke at a time.",
  "Your limitation is only your imagination when you keep practicing.",
];

function pickQuote() {
  return RACE_QUOTES[Math.floor(Math.random() * RACE_QUOTES.length)];
}

const moment = require("moment");

function getRoom(room) {
  if (!raceRooms[room]) {
    raceRooms[room] = {
      content: pickQuote(),
      raceObj: {},
      startTimes: {},
    };
  }
  return raceRooms[room];
}

function formatemessage(username, text) {
  return {
    username,
    text,
    time: moment().format("h:mm a"),
  };
}

function content_msg(username, room) {
  const roomData = getRoom(room);
  roomData.raceObj[username] = { wpm: 0, progress: 0 };
  roomData.startTimes[username] = Date.now();
  return roomData.content;
}

function content_check(value, user, room) {
  const roomData = getRoom(room);
  const text = roomData.content;

  let progress = 0;
  let flag = true;
  for (let i = 0; i < value.length; i++) {
    if (value[i] !== text[i]) {
      flag = false;
    } else if (flag) {
      progress++;
    }
  }

  const startedAt = roomData.startTimes[user] || Date.now();
  const elapsedMinutes = Math.max((Date.now() - startedAt) / 60000, 1 / 60);
  const wordsTyped = progress / 5;
  const wpm = Math.max(0, Math.round(wordsTyped / elapsedMinutes));

  roomData.raceObj[user] = { wpm, progress };
  return [roomData.raceObj, flag, text.length, user];
}

function resetuser(user, room) {
  const roomData = raceRooms[room];
  if (!roomData) return;
  delete roomData.raceObj[user];
  delete roomData.startTimes[user];
}

module.exports = {
  content_msg,
  formatemessage,
  content_check,
  resetuser,
};
