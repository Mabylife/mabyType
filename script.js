import { wordsData } from "./wordsData.js";

const allowkeys = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
  "dot",
  "comma",
  "CapsLock",
  "backspace",
  "enter",
  "shift",
  "space",
  "tab",
];
const volumnBut = document.getElementById("volumnBut");
const hudBut = document.getElementById("hudBut");
const huds = document.querySelectorAll(".hud");
const capsLockWarning = document.getElementById("capsLockWarning");
const replayBut = document.getElementById("replayBut");
const nextBut = document.getElementById("nextBut");
const modeBut = document.getElementById("modeBut");
const wordmark = document.querySelector(".wordmark");
const butCon = document.querySelector(".butCon");
const showArea = document.getElementById("mainText");
const unfocusedCover = document.getElementById("unfocused");
const resultCon = document.getElementById("resultCon");
const audioCache = {};
const loadingScreen = document.querySelector(".loadingScreen");
let inputCount;
let ansArray = [];
let isWordsMode = true;
let times = 10;
let finished = false;
let totalScrollWidth = 0;
let started = false;
let allChar = [];
let hudChar = 0;
let totaltime = 0;
let timerInterVal;
let timerStart;
let timerStop;
let volumnStat = true;
let hudStat = true;
let totalCD;
let addedCharLength = 0;
let beforeAnsArrayLength;
let initCount = 0;
let isInitComplete = false;
window.changeMode = changeMode;
window.replay = replay;
window.next = next;
window.toggleVolumn = toggleVolumn;
window.toggleHud = toggleHud;
let typedArray = [];

init();

function init() {
  initAudioCache();
  initEventListeners();
  startNewReset();
  takeAns(times);
  showText(ansArray.length);
  if (document.fonts.status === "loaded") {
    initCount++;
  } else {
    document.fonts.onloadingdone = function () {
      initCount++;
    };
  }

  let initCheckInterval = setInterval(() => {
    if (initCount === 6) {
      initComplete();
      clearInterval(initCheckInterval);
    }
  }, 500);
}

function hideLoadingScreen() {
  loadingScreen.style.animation = "fadeOut 1s forwards";
  setTimeout(() => {
    loadingScreen.style.zIndex = "-10";
  }, 1000);
}

function initComplete() {
  console.log("Init Complete");
  hideLoadingScreen();
  setTimeout(() => {
    isInitComplete = true;
  }, 500);
}

function check() {
  if (finished) {
    return;
  }
  let tpinputCount = typedArray.length - 1;

  if (started === false && tpinputCount === 0) {
    start();
  }

  if (tpinputCount < inputCount) {
    let indexChar = document.getElementById(`char${inputCount}`);
    if (indexChar) {
      indexChar.classList.remove("correct", "incorrect", "wrongSpace");
    }
    scrollToCurrentChar("back");
    inputCount = tpinputCount;
  } else {
    inputCount = tpinputCount;
    scrollToCurrentChar("forward");
  }

  let inputCurrent = typedArray[inputCount];
  let indexChar = document.getElementById(`char${inputCount}`);
  if (indexChar) {
    if (inputCurrent === ansArray[inputCount]) {
      if (ansArray[inputCount] === " ") {
        indexChar.classList.remove("wrongSpace");
      }
      indexChar.classList.remove("incorrect");
      indexChar.classList.add("correct");
    } else {
      if (ansArray[inputCount] === " ") {
        indexChar.classList.add("wrongSpace");
      }
      indexChar.classList.remove("correct");
      indexChar.classList.add("incorrect");
    }
  }
  if (inputCount === ansArray.length - 1 && started && isWordsMode) {
    finish();
    return;
  }

  if (inputCount === ansArray.length - 30 && started && !isWordsMode) {
    takeAns(30);
    showText(30);
    return;
  }
  countChar();
}

function takeAns(times) {
  beforeAnsArrayLength = ansArray.length;
  addedCharLength = 0;
  for (let i = 0; i < times; i++) {
    let word = wordsData[randomInt(0, wordsData.length - 1)];
    for (let char of word) {
      ansArray.push(char);
      addedCharLength++;
    }
    ansArray.push(" ");
    addedCharLength++;
  }
  if (isWordsMode) {
    ansArray.pop();
    addedCharLength--;
  }

  initCount++;
}

function logArray(array) {
  array.forEach((char, index) => {
    console.log(`char${index}: ${char}`);
  });
}

function showText(times) {
  for (
    let i = beforeAnsArrayLength;
    i < addedCharLength + beforeAnsArrayLength;
    i++
  ) {
    let newChar = document.createElement("span");
    newChar.textContent = ansArray[i];
    if (ansArray[i] === " ") {
      newChar.classList.add("mainTextSpace");
    }
    newChar.id = `char${i}`;
    newChar.classList.add("mainTextChar");
    showArea.appendChild(newChar);
  }

  allChar = document.querySelectorAll(".mainTextChar");

  initCount++;
}

function next() {
  if (volumnStat) {
    audioCache["shift"].cloneNode().play();
  }
  finish();
  allChar.forEach((char) => {
    char.remove();
  });
  setTimeout(() => {
    nextBut.classList.remove("active");
  }, 300);
  nextBut.classList.add("active");
  startNewReset();
  takeAns(times);
  showText(ansArray.length);
}

function replay() {
  if (volumnStat) {
    audioCache["shift"].cloneNode().play();
  }
  setTimeout(() => {
    replayBut.classList.remove("active");
  }, 300);
  replayBut.classList.add("active");

  finish();
  let tmpAnsArray = [...ansArray];
  startNewReset();
  ansArray = tmpAnsArray;
  showText(ansArray.length);
}

function startNewReset() {
  const wpmValue = document.getElementById("wpmValue");
  const cpmValue = document.getElementById("cpmValue");
  const accValue = document.getElementById("accValue");
  const timeValue = document.getElementById("timeValue");
  const grossText = document.getElementById("grossText");
  if (wpmValue) wpmValue.innerText = "";
  if (cpmValue) cpmValue.innerText = "";
  if (accValue) accValue.innerText = "";
  if (timeValue) timeValue.innerText = "";
  if (grossText) grossText.innerText = "";
  typedArray = [];
  allChar.forEach((char) => {
    char.remove();
  });
  showArea.style.transform = "none";
  inputCount = 0;
  ansArray.length = 0;
  finished = false;
  totalScrollWidth = 0;
  started = false;
  resultCon.style.opacity = "0";
  showArea.innerHTML = "";
  totaltime = 0;
  resultCon.style.opacity = "0";
  initCount++;
}
function finish() {
  timerStop = performance.now();
  wordmark.style.opacity = "1";
  butCon.style.opacity = "1";
  finished = true;
  if (!isWordsMode) {
    allChar.forEach((char) => {
      if (
        char.classList.contains("incorrect") ||
        char.classList.contains("correct")
      ) {
      } else {
        char.remove();
      }
    });
  }
  makeResult();
  hudDisplay(false);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function changeMode() {
  setTimeout(() => {
    modeBut.classList.remove("active");
  }, 300);
  modeBut.classList.add("active");

  if (isWordsMode) {
    if (times === 10) {
      times = 30;
      modeBut.innerText = "30 words";
    } else if (times === 30) {
      isWordsMode = false;
      times = 30;
      totalCD = 15;
      modeBut.innerText = "15 seconds";
    }
  } else {
    if (totalCD === 15) {
      times = 30;
      totalCD = 30;
      modeBut.innerText = "30 seconds";
    } else if (totalCD === 30) {
      isWordsMode = true;
      times = 10;
      modeBut.innerText = "10 words";
    }
  }

  next();
}

function setCharOfset() {
  showArea.style.transform = `translateX(-${totalScrollWidth}px)`;
}

function scrollToCurrentChar(type) {
  let scrollWidth;
  if (document.getElementById(`char${inputCount}`)) {
    if (type === "back") {
      scrollWidth = document
        .getElementById(`char${inputCount}`)
        .getBoundingClientRect().width;
      totalScrollWidth -= scrollWidth;
    } else if (type === "forward") {
      scrollWidth = document
        .getElementById(`char${inputCount}`)
        .getBoundingClientRect().width;
      totalScrollWidth += scrollWidth;
    }
    setCharOfset();
  }
}

function start() {
  wordmark.style.opacity = "0.5";
  butCon.style.opacity = "0.5";
  started = true;
  timerStart = performance.now();
  hudDisplay(true);
  if (!isWordsMode) {
    let altTimer = setInterval(() => {
      finish();
      clearInterval(altTimer);
    }, totalCD * 1000);
  }
}

function makeResult() {
  let correct; //correct char
  let incorrect; //incorrect char
  let cpm; // correct char per minute
  let wpm; //word per minute (cpm / 5)
  let acc; // accuracy (correct / total char)
  let seconds; // ss.ss (ms / 1000)
  let rcpm; // all char per minute
  let rwpm; // all word per minute (rcpm / 5)
  let tmpacc; // temp accuracy (correct / total char)

  correct = document.querySelectorAll(".correct").length;
  incorrect = document.querySelectorAll(".incorrect").length;
  seconds = (timerStop - timerStart) / 1000;
  cpm = (correct / seconds) * 60;
  wpm = cpm / 5;
  rcpm = ((correct + incorrect) / seconds) * 60;
  rwpm = rcpm / 5;
  tmpacc = (correct / (correct + incorrect)) * 100;
  acc = tmpacc.toFixed(1);

  if (!isWordsMode) {
    seconds = totalCD;
    ㄍ;
  }

  const wpmValue = document.getElementById("wpmValue");
  const cpmValue = document.getElementById("cpmValue");
  const accValue = document.getElementById("accValue");
  const timeValue = document.getElementById("timeValue");

  wpmValue.innerText = wpm.toFixed(0) + " / " + rwpm.toFixed(0);
  cpmValue.innerText = cpm.toFixed(0) + " / " + rcpm.toFixed(0);
  accValue.innerText = acc + " %";
  timeValue.innerText = seconds.toFixed(2) + " s";

  if (acc < 80) {
    wpmValue.innerText = "Failed";
    cpmValue.innerText = "Failed";
    const grossText = document.getElementById("grossText");
    grossText.innerText = "Low Accuracy";
  } else {
    const grossText = document.getElementById("grossText");
    grossText.innerText = "Net / Gross";
  }

  const resultCon = document.getElementById("resultCon");
  resultCon.style.opacity = "1";
}

function hudDisplay(status) {
  if (status) {
    huds.forEach((hud) => {
      hud.style.opacity = "1";
    });
  } else {
    huds.forEach((hud) => {
      hud.style.opacity = "0";
    });
  }

  if (!hudStat) {
    huds.forEach((hud) => {
      hud.style.opacity = "0";
    });
  }

  clearInterval(timerInterVal);
  const timer = document.getElementById("hudTimer");
  totaltime = 0;
  hudChar = 0;
  const counter = document.getElementById("hudCounter");
  if (!status) {
    setTimeout(() => {
      timer.innerText = totaltime + "s";
      counter.innerText = hudChar;
    }, 200);
  } else {
    timer.innerText = totaltime + "s";
    counter.innerText = hudChar;
  }

  if (status) {
    clearInterval(timerInterVal);
    timerInterVal = setInterval(() => {
      totaltime += 1;
      timer.innerText = totaltime + "s";
    }, 1000);
  }
}

function countChar() {
  hudChar = typedArray.length;
  const counter = document.getElementById("hudCounter");
  counter.innerText = hudChar;
}

function toggleVolumn() {
  if (volumnStat) {
    volumnStat = false;
    const volumnIcon = document.getElementById("volumnIcon");
    volumnIcon.src = "icons/volumnOff.svg";
    volumnBut.classList.add("pressed");
  } else {
    volumnStat = true;
    const volumnIcon = document.getElementById("volumnIcon");
    volumnIcon.src = "icons/volumnOn.svg";
    volumnBut.classList.remove("pressed");
  }
  if (volumnStat) {
    audioCache["shift"].cloneNode().play();
  }
}

function toggleHud() {
  if (volumnStat) {
    audioCache["shift"].cloneNode().play();
  }

  if (hudStat) {
    huds.forEach((hud) => {
      hud.style.opacity = "0";
    });
    hudStat = false;
    const hudIcon = document.getElementById("hudIcon");
    hudIcon.src = "icons/hudOff.svg";
    hudBut.classList.add("pressed");
  } else {
    hudStat = true;
    if (!finished && started) {
      huds.forEach((hud) => {
        hud.style.opacity = "1";
      });
    }
    const hudIcon = document.getElementById("hudIcon");
    hudIcon.src = "icons/hud.svg";
    hudBut.classList.remove("pressed");
  }
}

function initAudioCache() {
  allowkeys.forEach((key) => {
    const audio = new Audio(`keyboardSounds/${key}.wav`);
    audio.load(); // 預加載
    audioCache[key] = audio;
  });

  initCount++;
}

function initEventListeners() {
  // This part is for input
  document.addEventListener("keydown", (e) => {
    if (!isInitComplete) {
      console.log("Waiting for init to complete...");
      typedArray = [];
      return;
    }
    let key = e.key;
    if (e.key === "Backspace") {
      typedArray.pop();
      check();
    } else if (/^[a-zA-Z ,\.]$/.test(key)) {
      typedArray.push(key);
      check();
    }
    if (volumnStat) {
      let keyName = key;
      if (key === " ") keyName = "space";
      if (key === ".") keyName = "dot";
      if (key === ",") keyName = "comma";

      if (audioCache[keyName.toLowerCase()]) {
        audioCache[keyName.toLowerCase()].cloneNode().play();
      }
    }
  });
  ////////////////////////////////////////////////////////////

  window.addEventListener("focus", () => {
    unfocusedCover.style.opacity = "0";
    setTimeout(() => {
      unfocusedCover.style.zIndex = "-5";
    }, 200);
  });

  window.addEventListener("blur", () => {
    unfocusedCover.style.zIndex = "5";
    unfocusedCover.style.opacity = "1";
  });

  document.addEventListener("keyup", function (keyboardEvent) {
    const capsLockOn = keyboardEvent.getModifierState("CapsLock");
    if (capsLockOn) {
      capsLockWarning.style.opacity = "1";
    } else if (capsLockWarning.style.opacity === "1") {
      capsLockWarning.style.opacity = "0";
    }
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      next();
      setTimeout(() => {
        nextBut.classList.remove("active");
      }, 300);
      nextBut.classList.add("active");
    }
    if (e.altKey && e.key === "r") {
      replay();
      setTimeout(() => {
        replayBut.classList.remove("active");
      }, 300);
      replayBut.classList.add("active");
      e.preventDefault();
    }
    if (e.altKey && e.key === "m") {
      changeMode();
      setTimeout(() => {
        modeBut.classList.remove("active");
      }, 300);
      modeBut.classList.add("active");
      e.preventDefault();
    }
    if (
      e.key === " " ||
      e.key === "arrowup " ||
      e.key === "ArrowDown" ||
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight"
    ) {
      e.preventDefault();
    }

    if (e.ctrlKey && e.key === "a") {
      e.preventDefault();
    }
  });

  initCount++;
}
