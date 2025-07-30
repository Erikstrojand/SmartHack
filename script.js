
function caesarEncrypt(text, shift = 3) {
  return text.replace(/[a-z]/gi, c => {
    const base = c === c.toUpperCase() ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + shift + 26) % 26) + base);
  });
}

function caesarDecrypt(text, shift = 3) {
  return caesarEncrypt(text, -shift);
}

function atbashEncrypt(text) {
  return text.replace(/[a-z]/gi, c => {
    const base = c === c.toUpperCase() ? 65 : 97;
    return String.fromCharCode(25 - (c.charCodeAt(0) - base) + base);
  });
}

function atbashDecrypt(text) {
  return atbashEncrypt(text);
}

function rot13(text) {
  return caesarEncrypt(text, 13);
}

function vigenereEncrypt(text, key = "key") {
  let output = "";
  key = key.toLowerCase();
  let keyIndex = 0;
  for (let i = 0; i < text.length; i++) {
    let c = text[i];
    if (/[a-z]/i.test(c)) {
      const base = c === c.toUpperCase() ? 65 : 97;
      const shift = key.charCodeAt(keyIndex % key.length) - 97;
      c = String.fromCharCode(((c.charCodeAt(0) - base + shift + 26) % 26) + base);
      keyIndex++;
    }
    output += c;
  }
  return output;
}

function vigenereDecrypt(text, key = "key") {
  let output = "";
  key = key.toLowerCase();
  let keyIndex = 0;
  for (let i = 0; i < text.length; i++) {
    let c = text[i];
    if (/[a-z]/i.test(c)) {
      const base = c === c.toUpperCase() ? 65 : 97;
      const shift = key.charCodeAt(keyIndex % key.length) - 97;
      c = String.fromCharCode(((c.charCodeAt(0) - base - shift + 26) % 26) + base);
      keyIndex++;
    }
    output += c;
  }
  return output;
}




function affineEncrypt(text, a = 5, b = 8) {
  return text.replace(/[a-z]/gi, c => {
    const base = c === c.toUpperCase() ? 65 : 97;
    const x = c.charCodeAt(0) - base;
    const y = (a * x + b) % 26;
    return String.fromCharCode(y + base);
  });
}

function affineDecrypt(text, a = 5, b = 8) {
  const modInverse = (a, m) => {
    for (let i = 0; i < m; i++) if ((a * i) % m === 1) return i;
    return 1;
  };
  const a_inv = modInverse(a, 26);
  return text.replace(/[a-z]/gi, c => {
    const base = c === c.toUpperCase() ? 65 : 97;
    const y = c.charCodeAt(0) - base;
    const x = (a_inv * (y - b + 26)) % 26;
    return String.fromCharCode(x + base);
  });
}


function base64Encrypt(text) {
  return btoa(text);
}

function base64Decrypt(text) {
  return atob(text);
}

// === Cipher Registrry ===

const ciphers = {
  caesar: {
    encrypt: (txt) => caesarEncrypt(txt, 5),
    decrypt: (txt) => caesarDecrypt(txt, 5)
  },
  atbash: {
    encrypt: atbashEncrypt,
    decrypt: atbashDecrypt
  },
  rot13: {
    encrypt: rot13,
    decrypt: rot13
  },
  vigenere: {
    encrypt: (txt) => vigenereEncrypt(txt, "key"),
    decrypt: (txt) => vigenereDecrypt(txt, "key")
  },
    base64: {
    encrypt: base64Encrypt,
    decrypt: base64Decrypt
  },
  affine: {
    encrypt: (txt) => affineEncrypt(txt, 5, 8),
    decrypt: (txt) => affineDecrypt(txt, 5, 8)
  }
};

let currentLevel = 1;
let correctKey = "";
let answer = "";
let encryptionSteps = [];

window.addEventListener("DOMContentLoaded", () => {
  const difficultyContainer = document.getElementById("difficultyContainer");
  const keyConsole = document.getElementById("keyConsole");
  const gameSection = document.getElementById("gameSection");

  keyConsole.style.display = "none";
  gameSection.style.display = "none";

  // Difficulty selec
  document.querySelectorAll(".difficulty-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      currentLevel = parseInt(btn.dataset.level);
      difficultyContainer.style.display = "none";
      elipsyContainer.style.display = "none";
      elipsyContainer2.style.display = "none";
      h4.style.display = "none";
      keyConsole.style.display = "block";
      generateTextDump(currentLevel);
    });
  });

  document.getElementById("keySubmitBtn").addEventListener("click", checkKey);
  document.getElementById("submitBtn").addEventListener("click", checkAnswer);
  document.getElementById("showAnswerBtn").addEventListener("click", () => {
  const resultBox = document.getElementById("result");

  if (encryptionSteps.length === 0) {
    resultBox.innerHTML = "️No encryption steps available.";
    return;
  }

  let output = `<strong>Full encryption path:</strong><br><code>`;
  encryptionSteps.forEach(([before, cipher, after]) => {
    output += `${before} <strong>(${cipher})</strong> → ${after}<br>`;
  });
  output += `</code><br><strong>Answer:</strong> ${answer}`;

  resultBox.innerHTML = output;
  });
});

function generateTextDump(level) {
  const textDump = document.getElementById("textDump");
  const keyLength = 4 + level;
  const totalWords = 12 + level * 4;
  const wordPool = new Set();

  // Generate correct key
  correctKey = randomWord(keyLength);
  wordPool.add(correctKey);

  // Add distractors with overlap
  while (wordPool.size < totalWords) {
    const changes = Math.floor(Math.random() * keyLength); // 0–4 letter change
    const variation = mutateWord(correctKey, changes);
    wordPool.add(variation);
  }

  // Convert to array and shuffle
  const wordArray = Array.from(wordPool);
  shuffleArray(wordArray);

  // Wrap words with junk — now pass level
  const junkedWords = wordArray.map(word => insertInJunk(word, level));

  // Format into 4-column lines
  const dumpLines = [];
  for (let i = 0; i < junkedWords.length; i += 4) {
    const chunk = junkedWords.slice(i, i + 4).join('');
    dumpLines.push(chunk);
  }

  // Output
  textDump.textContent = dumpLines.join('\n');
}


// Adds junk symbol around the word
function insertInJunk(word, level) {
  const junkChars = "!@#$%^&*{}[]<>/|+=-~";
  const pad = () => {
    const length = Math.floor(Math.random() * 2 + 1 + level * 5); // More junk as level increases
    return Array.from({ length }, () =>
      junkChars[Math.floor(Math.random() * junkChars.length)]
    ).join('');
  };
  return pad() + word + pad();
}


// Mutate given letters in a word
function mutateWord(word, changes) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const arr = word.split('');
  const usedIndexes = new Set();

  for (let i = 0; i < changes; i++) {
    let idx;
    do {
      idx = Math.floor(Math.random() * arr.length);
    } while (usedIndexes.has(idx));
    usedIndexes.add(idx);
    arr[idx] = alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return arr.join('');
}

// Generates random uppercase word
function randomWord(length) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
}

// FisherYates shuffle
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}


function checkKey() {
  const input = document.getElementById("keyGuess").value.trim().toUpperCase();
  const resultBox = document.getElementById("keyResult");

  if (input === correctKey) {
    resultBox.textContent = "> ACCESS GRANTED";

    // Show wave puzzle below and start it
    const waveSection = document.getElementById("wavePuzzle");
    waveSection.style.display = "block";

    // Only initialze wave once
    if (!window._waveStarted) {
      initWavePuzzle(); //function handles the canvas animation
      window._waveStarted = true;
    }

  } else {
    const similarity = countSimilarity(input, correctKey);
    resultBox.textContent = `> ACCESS DENIED — Similarity: ${similarity}/${correctKey.length}`;

    // Red blink effect
    const inputBox = document.getElementById("keyGuess");
    inputBox.classList.remove("error");
    void inputBox.offsetWidth; // Force reflow
    inputBox.classList.add("error");
  }
}




function countSimilarity(guess, target) {
  const len = Math.min(guess.length, target.length);
  let count = 0;
  for (let i = 0; i < len; i++) {
    if (guess[i] === target[i]) count++;
  }
  return count;
}

function generateChallenge(level) {
  const sentencePool = [
    "HELLO WORLD",
    "SECURE THIS MESSAGE",
    "FIND THE PASSWORD",
    "THIS IS A WORD",
    "THE CODE IS HIDDEN",
    "DECRYPT THIS TEXT",
    "MESSAGE IN A BOTTLE",
    "KEYS AND CIPHERS",
    "ACCESS GRANTED",
    "LEVEL COMPLETE",
    "THE QUICK BROWN FOX",
    "JUMPED OVER THE FENCE",
    "NAH THIS IS HARD"
  ];

  let original = sentencePool[Math.floor(Math.random() * sentencePool.length)];
  answer = original;

  let current = original;
  encryptionSteps = [];

  for (let i = 0; i < level; i++) {
    const cipherNames = Object.keys(ciphers);
    const selected = cipherNames[Math.floor(Math.random() * cipherNames.length)];
    const cipher = ciphers[selected];

    const key = cipher.generateKey ? cipher.generateKey() : null;
    const encrypted = cipher.encrypt(current, key);

    // Save step [before, cipherName + optional key, after]
    const cipherLabel = key ? `${selected} (key: ${key})` : selected;
    encryptionSteps.push([current, cipherLabel, encrypted]);

    current = encrypted;
  }

  document.getElementById("ciphered").textContent = current;
}


function checkAnswer() {
  const input = document.getElementById("guess");
  const guess = input.value.trim().toUpperCase();
  const resultBox = document.getElementById("result");

  if (guess === answer) {
    resultBox.textContent = " > Correct! You've decoded the message.";
    input.classList.remove("error");
  } else {
    resultBox.textContent = " > Incorrect. Try again or reveal the answer.";
    input.classList.remove("error"); // Reset first to allow animation retriger
    void input.offsetWidth; // Force reflow retrigger animation
    input.classList.add("error");
  }
}



function initWavePuzzle() {
  const canvas = document.getElementById("waveCanvas");
  const ctx = canvas.getContext("2d");

  const blueAmpSlider = document.getElementById("blueAmpSlider");
  const yellowAmpSlider = document.getElementById("yellowAmpSlider");
  const waveSlider = document.getElementById("waveSlider");
  const resultText = document.getElementById("waveResult");

  const targetAmplitudeLeft = Math.floor(Math.random() * 20) + 30;
  const targetAmplitudeRight = Math.floor(Math.random() * 20) + 30;
  const targetWavelength = Math.floor(Math.random() * 40) + 40;

  window.targetWave = {
    leftAmp: targetAmplitudeLeft,
    rightAmp: targetAmplitudeRight,
    wavelength: targetWavelength,
  };

  let t = 0;
  let accessGranted = false;

  function drawWave(direction, amplitude, wavelength, color) {
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    for (let x = 0; x < canvas.width; x++) {
      const phase = direction === 1 ? x - t : x + t;
      const y = amplitude * Math.sin((phase / wavelength) * 2 * Math.PI);
      ctx.lineTo(x, canvas.height / 2 + y);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function drawCombined(leftAmp, rightAmp, wavelength, color) {
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    for (let x = 0; x < canvas.width; x++) {
      const y1 = leftAmp * Math.sin(((x + t) / wavelength) * 2 * Math.PI);
      const y2 = rightAmp * Math.sin(((x - t) / wavelength) * 2 * Math.PI);
      const y = y1 + y2;
      ctx.lineTo(x, canvas.height / 2 + y);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function drawTarget(leftAmp, rightAmp, wavelength, color) {
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    for (let x = 0; x < canvas.width; x++) {
      const y1 = leftAmp * Math.sin(((x + t) / wavelength) * 2 * Math.PI);
      const y2 = rightAmp * Math.sin(((x - t) / wavelength) * 2 * Math.PI);
      const y = y1 + y2;
      ctx.lineTo(x, canvas.height / 2 + y);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function checkMatch(leftAmp, rightAmp, wavelength) {
    if (accessGranted) return;

    const combinedY = [];
    const targetY = [];

    for (let x = 0; x < canvas.width; x++) {
      const y1 = leftAmp * Math.sin(((x + t) / wavelength) * 2 * Math.PI);
      const y2 = rightAmp * Math.sin(((x - t) / wavelength) * 2 * Math.PI);
      combinedY.push(y1 + y2);

      const yt1 = targetWave.leftAmp * Math.sin(((x + t) / targetWave.wavelength) * 2 * Math.PI);
      const yt2 = targetWave.rightAmp * Math.sin(((x - t) / targetWave.wavelength) * 2 * Math.PI);
      targetY.push(yt1 + yt2);
    }

    let totalDiff = 0;
    for (let i = 0; i < combinedY.length; i++) {
      totalDiff += Math.abs(combinedY[i] - targetY[i]);
    }

    const avgDiff = totalDiff / combinedY.length;

    if (avgDiff <= 2) {
      accessGranted = true;
      resultText.textContent = "> ACCESS GRANTED";
      resultText.style.color = "lime";

      // Advance next puzzle after short delay
      setTimeout(() => {
        document.getElementById("gameSection").style.display = "block";
        generateChallenge(currentLevel);
      }, 1000);
    } else {
      resultText.textContent = "";
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const leftAmp = parseInt(blueAmpSlider.value);
    const rightAmp = parseInt(yellowAmpSlider.value);
    const wave = parseInt(waveSlider.value);

    drawWave(-1, leftAmp, wave, "#00f");
    drawWave(1, rightAmp, wave, "#ff0");
    drawCombined(leftAmp, rightAmp, wave, "#fff");
    drawTarget(targetWave.leftAmp, targetWave.rightAmp, targetWave.wavelength, "#0f0");

    checkMatch(leftAmp, rightAmp, wave);

    t += 0.2 * currentLevel;
    if (!accessGranted) {
      requestAnimationFrame(animate);
    }
  }

  animate();
}
