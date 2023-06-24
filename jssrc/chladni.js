const sketch = (p) => {
  /* Variables */
  let particles = [];
  let sliders, m, n, v;
  v = parseFloat(document.querySelector("#vSlider").value);

  // vibration strength params
  let minWalk = 0.002;

  const settings = {
    nParticles: 20000,
    canvasSize: [600, 600],
    drawHeatmap: false,
  };


  // chladni 2D closed-form solution - returns between -1 and 1
  const chladniSquare = (x, y, m, n, pScale) => {
    const L = 1; // Normalized side length
    const scaledX = x * pScale;
    const scaledY = y * pScale;
    return (
      Math.cos((n * Math.PI * scaledX) / L) *
        Math.cos((m * Math.PI * scaledY) / L) -
      Math.cos((m * Math.PI * scaledX) / L) *
        Math.cos((n * Math.PI * scaledY) / L)
    );
  };

  /* Initialization */
  const DOMinit = () => {
    let canvas = p.createCanvas(...settings.canvasSize, p.P2D);
    canvas.parent("sketch-container");
    canvas.id("chladniCanvas");

    // sliders
    sliders = {
      m: p.select("#mSlider"),
      n: p.select("#nSlider"),
      pSlider: p.select("#pSlider"), // Change 'p' to 'pSlider'
      v: p.select("#vSlider"),
      num: p.select("#numSlider"),
    };

    //audio file input
    let audioInput = p.select("#audioInput");
    audioInput.input(loadAudioFile);

    let bgColor = p.select("#bgColor");
    bgColor.input(() => {
      p.background(bgColor.value());
    });
  };

    function invertColor(hexcolor) {
      const color = hexcolor.substring(1); // remove # from string
      const rgb = parseInt(color, 16); // convert rrggbb to decimal
      const invertedRgb = 0xffffff - rgb; // invert three bytes
      const invertedColor = `#${(`000000${invertedRgb.toString(16)}`).slice(-6)}`;
      return invertedColor;
    }

  const playButton = p.select("#playButton");
  playButton.mousePressed(() => {
    if (p.mouseButton === p.LEFT) {
      // Check if the left mouse button was clicked
      if (audioSource && audioContext.state === "suspended") {
        audioContext.resume();
      }
    }
  });

  const pauseButton = p.select("#pauseButton");
  pauseButton.mousePressed(() => {
    if (p.mouseButton === p.LEFT) {
      // Check if the left mouse button was clicked
      if (audioSource && audioContext.state === "running") {
        audioContext.suspend();
      }
    }
  });

  class Particle {
    constructor(p) {
      this.p = p;
      this.x = p.random(0, 1);
      this.y = p.random(0, 1);
      this.stochasticAmplitude;

      this.updateOffsets();
    }

    move() {
      let eq = chladniSquare(this.x, this.y, m, n, pSlider); // Pass pSlider as an additional argument
      this.stochasticAmplitude = this.p.abs(eq) * v;

      if (this.stochasticAmplitude <= minWalk)
        this.stochasticAmplitude = minWalk;

      this.x += this.p.random(
        -this.stochasticAmplitude,
        this.stochasticAmplitude
      );
      this.y += this.p.random(
        -this.stochasticAmplitude,
        this.stochasticAmplitude
      );

      this.updateOffsets();
    }

    updateOffsets() {
      if (this.x <= 0) this.x = 0;
      if (this.x >= 1) this.x = 1;
      if (this.y <= 0) this.y = 0;
      if (this.y >= 1) this.y = 1;

      this.xOff = this.p.width * this.x;
      this.yOff = this.p.height * this.y;
    }

    show() {
      this.p.stroke(particleColor); // Change the stroke color to red
      this.p.point(this.xOff, this.yOff);
    }
  }

  const setupParticles = () => {
    for (let i = 0; i < settings.nParticles; i++) {
      particles[i] = new Particle(p);
    }
  };

  let audioContext;
  let audioSource;
  let analyser;
  let bufferLength;
  let dataArray;

  const loadAudioFile = (e) => {
    if (!audioContext) {
      audioContext = new AudioContext();
    }

    let file = e.target.files[0];
    let fileReader = new FileReader();

    fileReader.onload = (e) => {
      let arrayBuffer = e.target.result;
      audioContext.decodeAudioData(
        arrayBuffer,
        (buffer) => {
          audioBuffer = buffer; // Store the buffer in a variable
          analyser = audioContext.createAnalyser();
          analyser.fftSize = 2048;
          bufferLength = analyser.frequencyBinCount;
          dataArray = new Uint8Array(bufferLength);

          const processChunk = () => {
            if (!audioSource) {
              audioSource = audioContext.createBufferSource();
              audioSource.buffer = audioBuffer;
              audioSource.connect(analyser);
              analyser.connect(audioContext.destination);
              audioSource.start(0);
            }
          };

          processChunk();
        },
        (err) => {
          console.error("Error decoding audio data", err);
        }
      );
    };

    fileReader.readAsArrayBuffer(file);
  };

  const moveParticles = () => {
    let movingParticles = particles.slice(0, num);
    for (let particle of movingParticles) {
      particle.move();
      particle.show();
    }
  };

  const updateParams = () => {
    m = sliders.m.value();
    n = sliders.n.value();
    v = sliders.v.value();
    pSlider = sliders.pSlider.value(); // Keep the assignment as it is
    num = sliders.num.value(); // Change from n to N
  };

  const drawHeatmap = () => {
    if (settings.drawHeatmap) {
      let res = 10; // Try a higher value, e.g., 10 instead of 3
      for (let i = 0; i <= p.width; i += res) {
        for (let j = 0; j <= p.height; j += res) {
          let eq = chladni(i / p.width, j / p.height, a, b, m, n);
          p.noStroke();
          p.fill((eq + 1) * 127.5);
          p.square(i, j, res);
        }
      }
    }
  };

  const wipeScreen = () => {
    chladniCanvas = p.select("#bgColor");
    p.background(chladniCanvas.value());
    p.stroke(255);

  };

  p.setup = () => {
    DOMinit();
    setupParticles();
  };

  p.draw = () => {
    wipeScreen();
    // Always update v and num sliders
    v = sliders.v.value();
    num = sliders.num.value();
    
    particleColor = invertColor(chladniCanvas.value());

    if (audioSource) {
      analyser.getByteFrequencyData(dataArray);
      const maxIndex = dataArray.reduce(
        (iMax, x, i, arr) => (x > arr[iMax] ? i : iMax),
        0
      );

      // Modify the mapping ranges for a, b, and v
      n = p.map(dataArray[maxIndex], 0, 255, 1, 5);
    } else {
      // Update other parameters when audio is not playing
      updateParams();
    }
    drawHeatmap();
    moveParticles();
  };
};
export default sketch;
