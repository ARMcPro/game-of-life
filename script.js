const toggleButton = document.getElementById("toggle");
const clearButton = document.getElementById("clear");
const exportButton = document.getElementById("export");
const importButton = document.getElementById("import");
const fileInput = document.getElementById("fileInput");
const speedSlider = document.getElementById("speed");
const speedValueDisplay = document.getElementById("speed-value");
const counterDisplay = document.getElementById("counter");
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const container = document.getElementById('canvas-container');

let liveCells = new Set();
let isRunning = false;
let iteration = 0;
let speed = parseInt(speedSlider.value);
let cellSize = 20;
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let hasDragged = false;
let startX = 0;
let startY = 0;
let initialPinchData = null;
const DEAD_ZONE = 3;

function resizeCanvas() {
	canvas.width = container.clientWidth;
	canvas.height = container.clientHeight;
	draw();
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

canvas.addEventListener('mousedown', (e) => {
	isDragging = true;
	startX = e.clientX;
	startY = e.clientY;
});

canvas.addEventListener('mousemove', (e) => {
	if (isDragging) {
		const dx = e.clientX - startX;
		const dy = e.clientY - startY;

		if (!hasDragged && (Math.abs(dx) > DEAD_ZONE || Math.abs(dy) > DEAD_ZONE)) {
			hasDragged = true;
			canvas.style.cursor = 'grabbing';
		}
		if (hasDragged) {
			offsetX += dx;
			offsetY += dy;
			startX = e.clientX;
			startY = e.clientY;
			draw();
		}
	}
});

canvas.addEventListener('mouseup', (e) => {
	if (isDragging) {
		if (hasDragged) {
			hasDragged = false;
		} else {
			handleToggle(e.clientX, e.clientY);
		}
		isDragging = false;
	}
	canvas.style.cursor = 'pointer';
});

canvas.addEventListener('mouseleave', () => {
	isDragging = false;
	hasDragged = false;
	canvas.style.cursor = 'pointer';
});

canvas.addEventListener('wheel', (e) => {
	e.preventDefault();
	const zoomIntensity = 0.1;
	const rect = canvas.getBoundingClientRect();
	const mouseX = e.clientX - rect.left;
	const mouseY = e.clientY - rect.top;

	const worldX = (mouseX - offsetX) / cellSize;
	const worldY = (mouseY - offsetY) / cellSize;

	cellSize *= e.deltaY < 0 ? 1 + zoomIntensity : 1 / (1 + zoomIntensity);
	cellSize = Math.min(Math.max(10, cellSize), 100);

	offsetX = mouseX - worldX * cellSize;
	offsetY = mouseY - worldY * cellSize;

	draw();
});


canvas.addEventListener('touchstart', (e) => {
	e.preventDefault();
	if (e.touches.length === 1) {
		isDragging = true;
		const touch = e.touches[0];
		startX = touch.clientX;
		startY = touch.clientY;
	}
});

canvas.addEventListener('touchmove', (e) => {
	e.preventDefault();

	if (e.touches.length === 1 && isDragging) {
		const touch = e.touches[0];
		const dx = touch.clientX - startX;
		const dy = touch.clientY - startY;

		if (!hasDragged && (Math.abs(dx) > DEAD_ZONE || Math.abs(dy) > DEAD_ZONE)) {
			hasDragged = true;
			canvas.style.cursor = 'grabbing';
		}
		if (hasDragged) {
			offsetX += dx;
			offsetY += dy;
			startX = touch.clientX;
			startY = touch.clientY;
			draw();
		}

	} else if (e.touches.length === 2) {
		const touch1 = e.touches[0];
		const touch2 = e.touches[1];
		const currentDistance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
		const currentMidX = (touch1.clientX + touch2.clientX) / 2;
		const currentMidY = (touch1.clientY + touch2.clientY) / 2;

		if (!initialPinchData) {
			canvas.style.cursor = 'grabbing';
			initialPinchData = {
				distance: currentDistance,
				midX: currentMidX,
				midY: currentMidY,
				cellSize: cellSize,
				offsetX: offsetX,
				offsetY: offsetY
			};
		} else {
			const scaleFactor = currentDistance / initialPinchData.distance;
			const newCellSize = Math.min(Math.max(10, initialPinchData.cellSize * scaleFactor), 100);

			const worldX = (initialPinchData.midX - initialPinchData.offsetX) / initialPinchData.cellSize;
			const worldY = (initialPinchData.midY - initialPinchData.offsetY) / initialPinchData.cellSize;

			offsetX = currentMidX - worldX * newCellSize;
			offsetY = currentMidY - worldY * newCellSize;

			cellSize = newCellSize;
			draw();
		}
	}
});

canvas.addEventListener('touchend', (e) => {
	if (e.touches.length === 0 && isDragging) {
		const touch = e.changedTouches[0];

		if (hasDragged) {
			hasDragged = false;
		} else {
			handleToggle(touch.clientX, touch.clientY);
		}
	}
	canvas.style.cursor = 'pointer';
	isDragging = false;
	initialPinchData = null;
});

function handleToggle(clientX, clientY) {
	const rect = canvas.getBoundingClientRect();
	const x = Math.floor((clientX - rect.left - offsetX) / cellSize);
	const y = Math.floor((clientY - rect.top - offsetY) / cellSize);
	const key = `${x},${y}`;

	liveCells.has(key) ? liveCells.delete(key) : liveCells.add(key);
	draw();
}


function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	const minX = Math.floor(-offsetX / cellSize);
	const minY = Math.floor(-offsetY / cellSize);
	const maxX = Math.ceil((canvas.width - offsetX) / cellSize);
	const maxY = Math.ceil((canvas.height - offsetY) / cellSize);

	ctx.fillStyle = '#32CD32';
	liveCells.forEach(key => {
		const [x, y] = key.split(',').map(Number);
		if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
			ctx.fillRect(
				x * cellSize + offsetX,
				y * cellSize + offsetY,
				cellSize - 1,
				cellSize - 1
			);
		}
	});

	ctx.strokeStyle = '#333';
	ctx.lineWidth = 0.5;
	for (let x = minX; x <= maxX; x++) {
		for (let y = minY; y <= maxY; y++) {
			ctx.strokeRect(
				x * cellSize + offsetX,
				y * cellSize + offsetY,
				cellSize,
				cellSize
			);
		}
	}
}

function nextGeneration() {
	if (!isRunning) return;

	const neighborCounts = new Map();

	liveCells.forEach(key => {
		const [x, y] = key.split(',').map(Number);
		for (let dx = -1; dx <= 1; dx++) {
			for (let dy = -1; dy <= 1; dy++) {
				if (dx === 0 && dy === 0) continue;
				const neighborKey = `${x + dx},${y + dy}`;
				neighborCounts.set(neighborKey, (neighborCounts.get(neighborKey) || 0) + 1);
			}
		}
	});

	const newLiveCells = new Set();
	neighborCounts.forEach((count, key) => {
		const [x, y] = key.split(',').map(Number);
		const wasAlive = liveCells.has(key);

		if (wasAlive && (count === 2 || count === 3)) {
			newLiveCells.add(key);
		} else if (!wasAlive && count === 3) {
			newLiveCells.add(key);
		}
	});

	liveCells = newLiveCells;
	iteration++;
	counterDisplay.textContent = iteration;
	draw();
}

function clearGrid() {
	liveCells.clear();
	isRunning = false;
	iteration = 0;
	counterDisplay.textContent = iteration;
	toggleButton.textContent = "Start";
	draw();
}

toggleButton.addEventListener("click", () => {
	isRunning = !isRunning;
	toggleButton.textContent = isRunning ? "Pause" : "Start";
});

clearButton.addEventListener("click", clearGrid);

speedSlider.addEventListener("input", () => {
	speed = parseInt(speedSlider.value);
	speedValueDisplay.textContent = `${speed} ms`;

	clearInterval(loop);
	loop = setInterval(nextGeneration, speed);
});

exportButton.addEventListener("click", () => {
	const data = Array.from(liveCells).join(';');
	const blob = new Blob([data], { type: "text/plain" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = "game-of-life.txt";
	a.click();
	URL.revokeObjectURL(url);
});


importButton.addEventListener("click", () => {
	fileInput.click();
});

fileInput.addEventListener("change", () => {
	const file = fileInput.files[0];
	if (!file) return;
	const reader = new FileReader();
	reader.onload = () => {
		clearGrid();
		try {
			const data = reader.result.trim().split(';');
			data.forEach(key => liveCells.add(key));
			iteration = 0;
			counterDisplay.textContent = iteration;
			draw();
		} catch {
			alert("Failed to load layout.");
		}
		fileInput.value = "";
	};
	reader.readAsText(file);
});

draw();
speedValueDisplay.textContent = `${speed} ms`;
let loop = setInterval(nextGeneration, speed);
