import sketch from './jssrc/chladni.js';

document.addEventListener('DOMContentLoaded', () => {
  const collapsibleHeader = document.getElementById('collapsible-header');
  const settingsForm = document.getElementById('settings-form'); // Changed from 'settings' to 'settings-form'
  const sketchContainer = document.getElementById('sketch-container');
  const bgColor = document.getElementById('bgColor');
  const chladniCanvas = document.getElementById('chladniCanvas');

  bgColor.addEventListener('input', (e) => {
    const newColor = e.target.value;
    document.body.style.backgroundColor = newColor;
    chladniCanvas.style.backgroundColor = newColor;
    sketch.particleColor = invertColor(newColor);
    });

  // Toggle the settings menu when the header is clicked
  collapsibleHeader.addEventListener('click', () => {
    settingsForm.classList.toggle('hidden');
  });

  // Initialize the Chladni plate simulation
  new p5(sketch, document.getElementById('sketch-container'));
});

// variables to keep track of mouse position and box position
let isDragging = false;
let mouseX = 0;
let mouseY = 0;
let settingsX = 0;
let settingsY = 0;

// add event listeners for mouse events
document.getElementById("collapsible-header").addEventListener("mousedown", startDrag);
document.addEventListener("mouseup", stopDrag);
document.addEventListener("mousemove", drag);

// function to start dragging the box
function startDrag(event) {
  isDragging = true;
  mouseX = event.clientX;
  mouseY = event.clientY;
  settingsX = parseInt(document.getElementById("settings").style.left) || 0;
  settingsY = parseInt(document.getElementById("settings").style.top) || 0;
}

// function to stop dragging the box
function stopDrag() {
  isDragging = false;
}

// function to drag the box
function drag(event) {
  if (isDragging) {
    let deltaX = event.clientX - mouseX;
    let deltaY = event.clientY - mouseY;
    let newSettingsX = settingsX + deltaX;
    let newSettingsY = settingsY + deltaY;
    document.getElementById("settings").style.left = newSettingsX + "px";
    document.getElementById("settings").style.top = newSettingsY + "px";
  }
}