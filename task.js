const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = 150;
let rotation = 0;
let spinning = false;

const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9"];
const defaultSections = ["Yes", "No", "Maybe", "Try Again", "Definitely", "Not Sure", "Ask Later", "Good Luck"];
let sections = loadSections();
let history = loadHistory();

function loadSections() {
  const saved = localStorage.getItem('wheelSections');
  return saved ? JSON.parse(saved) : defaultSections;
}

function saveSections() {
  localStorage.setItem('wheelSections', JSON.stringify(sections));
}

function loadHistory() {
  const saved = localStorage.getItem('wheelHistory');
  return saved ? JSON.parse(saved) : [];
}

function saveHistory() {
  localStorage.setItem('wheelHistory', JSON.stringify(history));
}

function addToHistory(result) {
  const timestamp = new Date().toLocaleString();
  history.unshift({ result, timestamp });
  if (history.length > 50) history.pop();
  saveHistory();
  updateHistoryDisplay();
}

function updateHistoryDisplay() {
  const historyList = document.getElementById('historyList');
  if (history.length === 0) {
    historyList.innerHTML = '<p>No spins yet</p>';
    return;
  }
  historyList.innerHTML = history.map(item => `
    <div class="history-item">
      <div class="history-time">${item.timestamp}</div>
      <div class="history-result">${item.result}</div>
    </div>
  `).join('');
}

function drawWheel() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(rotation);
  ctx.translate(-centerX, -centerY);

  const anglePerSection = (Math.PI * 2) / sections.length;

  sections.forEach((label, index) => {
    const startAngle = index * anglePerSection;
    const endAngle = (index + 1) * anglePerSection;

    // Draw section
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = colors[index % colors.length];
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw label
    const labelAngle = startAngle + anglePerSection / 2;
    const labelX = centerX + (radius * 0.7) * Math.cos(labelAngle);
    const labelY = centerY + (radius * 0.7) * Math.sin(labelAngle);
    ctx.fillStyle = 'black';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(label, labelX, labelY);
  });

  ctx.restore();
}

function getResult() {
  const normalizedRotation = rotation % (Math.PI * 2);
  const anglePerSection = (Math.PI * 2) / sections.length;
  const sectionIndex = Math.floor((Math.PI * 2 - normalizedRotation) / anglePerSection) % sections.length;
  return sections[sectionIndex];
}

function spinWheel() {
  if (spinning) return;
  spinning = true;
  const spinDuration = 3000; // 3 seconds
  const startTime = Date.now();
  const startRotation = rotation;
  const spinAngle = Math.PI * 2 * 5 + Math.random() * Math.PI * 2; // 5 full rotations + random

  function animate() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / spinDuration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3); // Ease out
    rotation = startRotation + spinAngle * easeOut;

    drawWheel();

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      spinning = false;
      const result = getResult();
      document.getElementById('result').textContent = 'Result: ' + result;
      addToHistory(result);
    }
  }
  animate();
}

function updateWheel() {
  const input = document.getElementById('sectionsInput').value;
  if (input.trim()) {
    sections = input.split(',').map(s => s.trim()).filter(s => s);
  } else {
    sections = defaultSections;
  }
  saveSections();
  drawWheel();
}

// Initial draw
drawWheel();

// Populate input field with saved sections
document.getElementById('sectionsInput').value = sections.join(', ');

// Load and display history
updateHistoryDisplay();

// Add event listeners
document.getElementById('spinButton').addEventListener('click', spinWheel);
document.getElementById('updateButton').addEventListener('click', updateWheel);
document.getElementById('menuButton').addEventListener('click', () => {
  document.getElementById('historyPanel').classList.toggle('open');
});
document.getElementById('closeButton').addEventListener('click', () => {
  document.getElementById('historyPanel').classList.remove('open');
});
document.getElementById('clearHistory').addEventListener('click', () => {
  history = [];
  saveHistory();
  updateHistoryDisplay();
});
