const exercises = [
  { name: "Walk", duration: 1200, gif: "walk.gif" },
  { name: "Skipping", duration: 600, gif: "skipping.gif" },
  { name: "Abdominal Crunches", count: 10, gif: "abdominal_crunches.gif" },
  { name: "Russian Twist", count: 12, gif: "russian_twist.gif" },
  { name: "Mountain Climber", count: 12, gif: "mountain_climber.gif" },
  { name: "Heel Touch", count: 16, gif: "heel_touch.gif" },
  { name: "Leg Raises", count: 12, gif: "leg_raises.gif" },
  { name: "Plank", duration: 30, gif: "plank.gif" },
  { name: "Cobra Stretch", duration: 30, gif: "cobra_stretch.gif" },
  { name: "Spine Lumbar Twist Stretch Left", duration: 30, gif: "lumbar_twist_left.gif" },
  { name: "Spine Lumbar Twist Stretch Right", duration: 30, gif: "lumbar_twist_right.gif" },
  { name: "Jumping Jacks", duration: 30, gif: "jumping_jacks.gif" },
  { name: "Incline Push-ups", count: 6, gif: "incline_pushups.gif" },
  { name: "Knee Push-ups", count: 4, gif: "knee_pushups.gif" },
  { name: "Push-ups", count: 4, gif: "pushups.gif" },
  { name: "Chest Stretch", duration: 20, gif: "chest_stretch.gif" },
];

let startBtn = document.getElementById("startBtn");
let pauseBtn = document.getElementById("pauseBtn");
let resumeBtn = document.getElementById("resumeBtn");
let nextBtn = document.getElementById("nextBtn");
let durationSlider = document.getElementById("duration");
let durationLabel = document.getElementById("durationLabel");
let exerciseBox = document.getElementById("exerciseBox");
let exerciseName = document.getElementById("exerciseName");
let instructionText = document.getElementById("instructionText");
let timer = document.getElementById("timer");
let exerciseGif = document.getElementById("exerciseGif");
let historyList = document.getElementById("historyList");
let goalDaysInput = document.getElementById("goalDays");
let goalTracker = document.getElementById("goalTracker");

let currentIndex = 0;
let currentList = [];
let paused = false;
let countdownInterval = null;
let remainingTime = 0;

durationSlider.oninput = () => {
  durationLabel.textContent = `${durationSlider.value} mins`;
};

startBtn.addEventListener("click", () => {
  startBtn.disabled = true;
  pauseBtn.classList.remove("d-none");
  exerciseBox.classList.remove("d-none");
  currentList = scaleExercisesToDuration(durationSlider.value);
  currentIndex = 0;
  runExercises(currentList, currentIndex);
});

pauseBtn.addEventListener("click", () => {
  paused = true;
  pauseBtn.classList.add("d-none");
  resumeBtn.classList.remove("d-none");
  clearInterval(countdownInterval);
});

resumeBtn.addEventListener("click", () => {
  paused = false;
  pauseBtn.classList.remove("d-none");
  resumeBtn.classList.add("d-none");
  if (remainingTime > 0) {
    countdown(remainingTime, null, () => rest(() => runExercises(currentList, ++currentIndex)));
  }
});

nextBtn.addEventListener("click", () => {
  nextBtn.classList.add("d-none");
  rest(() => runExercises(currentList, ++currentIndex));
});

function speak(text) {
  const synth = window.speechSynthesis;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'en-US';
  synth.speak(utter);
}

function countdown(seconds, onTick, onComplete) {
  remainingTime = seconds;
  timer.textContent = remainingTime;
  countdownInterval = setInterval(() => {
    if (paused) return;
    remainingTime--;
    timer.textContent = remainingTime;
    if (remainingTime <= 3 && remainingTime > 0) speak(remainingTime);
    if (remainingTime <= 0) {
      clearInterval(countdownInterval);
      onComplete();
    }
  }, 1000);
}

function runExercises(list, index) {
  if (index >= list.length) {
    speak("Workout Complete!");
    exerciseName.textContent = "Workout Complete!";
    instructionText.textContent = "";
    timer.textContent = "";
    exerciseGif.src = "";
    pauseBtn.classList.add("d-none");
    resumeBtn.classList.add("d-none");
    saveRecord();
    displayHistory();
    displayGoalStatus();
    startBtn.disabled = false;
    return;
  }

  const current = list[index];
  exerciseName.textContent = current.name;
  exerciseGif.src = `images/${current.gif}`;

  if (current.duration) {
    instructionText.textContent = `Do for ${current.duration} seconds`;
    speak("Starting " + current.name);
    countdown(current.duration, null, () => rest(() => runExercises(list, index + 1)));
  } else {
    instructionText.textContent = `Do ${current.count} reps and click Next when done.`;
    speak("Start " + current.name);
    timer.textContent = "";
    nextBtn.classList.remove("d-none");
  }
}

function rest(callback) {
  exerciseName.textContent = "Rest";
  instructionText.textContent = "Take a break for 10 seconds";
  exerciseGif.src = "images/rest.gif"; // optional
  countdown(10, null, callback);
}

function scaleExercisesToDuration(mins) {
  const totalSeconds = mins * 60;
  let baseSeconds = exercises.reduce((acc, ex) => acc + (ex.duration || ex.count * 3), 0);
  const scale = totalSeconds / baseSeconds;
  return exercises.map(ex => {
    return ex.duration
      ? { ...ex, duration: Math.floor(ex.duration * scale) }
      : ex;
  });
}

function saveRecord() {
  const today = new Date().toLocaleDateString();
  const history = JSON.parse(localStorage.getItem("exerciseHistory")) || [];
  if (!history.includes(today)) {
    history.push(today);
    localStorage.setItem("exerciseHistory", JSON.stringify(history));
  }
}

function displayHistory() {
  const history = JSON.parse(localStorage.getItem("exerciseHistory")) || [];
  historyList.innerHTML = "";
  history.reverse().slice(0, 5).forEach(day => {
    const li = document.createElement("li");
    li.textContent = day;
    li.className = "list-group-item";
    historyList.appendChild(li);
  });
}

function saveGoal() {
  const goal = parseInt(goalDaysInput.value);
  if (!goal || goal <= 0) return;
  localStorage.setItem("goalDays", goal);
  displayGoalStatus();
}

function displayGoalStatus() {
  const goal = parseInt(localStorage.getItem("goalDays")) || 0;
  const history = JSON.parse(localStorage.getItem("exerciseHistory")) || [];
  goalTracker.innerHTML = "";

  if (goal <= 0) return;

  const today = new Date();
  for (let i = 0; i < goal; i++) {
    const date = new Date();
    date.setDate(today.getDate() - (goal - 1 - i));
    const dateStr = date.toLocaleDateString();

    const box = document.createElement("div");
    box.textContent = dateStr;
    box.style.padding = "5px 10px";
    box.style.borderRadius = "6px";
    box.style.fontSize = "12px";
    box.className = "text-white";
    box.style.backgroundColor = history.includes(dateStr) ? "green" : "red";
    goalTracker.appendChild(box);
  }
}

// Init
displayHistory();
displayGoalStatus();