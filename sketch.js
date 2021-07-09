let n = 6;
const maxN = 20;
let isPeriodicBC = false;
let np;
let spin;
let charge;
let flippability;
let mouseRegion;
const MOUSE_OUT_OF_RANGE = 0;
const MOUSE_ON_SPIN = 1;
const MOUSE_ON_PLAQUETTE = 2;
const xOffset = 100;
const yOffset = 100;
const xSpacing = 40;
const ySpacing = 40;
const backgroundColor = 220;
const flippableColor = 240;
const unflippableColor = 220;
let chargeColors;
let plainChargeColor;
let mouseSpinI;
let mouseSpinJ;
let mousePlaquetteI;
let mousePlaquetteJ;

let initialState;
const ZERO = 0;
const RANDOM = 1;
const NEEL = 2;

let buttonBC;
let selectSize;
let selectInitialState;
let buttonFlipState;

function setup() {
  createCanvas(400, 400);
  chargeColors = [color("#0066ff"), color("#ff9900"), color("#33cc33"), color("#ff0066")];
  plainChargeColor = color("#9900cc");
  
  buttonBC = createButton("Toggle Boundary Conditions");
  // buttonBC.position(0, 0);
  buttonBC.mousePressed(changeBC);
  
  selectSize = createSelect();
  // selectSize.position(20, 20);
  for (let size = 0; size <= maxN; ++size) {
    selectSize.option(str(size));
  }
  selectSize.changed(changeSize);
  selectSize.selected("6");
  
  selectInitialState = createSelect();
  // selectInitialState.position(200, 350);
  selectInitialState.option("Random");
  selectInitialState.option("Zero");
  selectInitialState.option("Neel");
  selectInitialState.changed(changeInitialState);
  // selectInitialState.selected("Zero");
  
  buttonFlipState = createButton("Flip All Spins");
  // buttonFlipState.position(350, 350);
  buttonFlipState.mousePressed(flipAllSpins);
  
  setupSpin();
  setupFlippabilityCharge();
}

function setupSpin() {
  spin = Array(n).fill().map(() => Array(n).fill(0));
  switch (initialState) {
    case RANDOM:
      for (let i = 0; i < n; ++i) {
        for (let j = 0; j < n; ++j) {
          spin[i][j] = Math.floor(random(2));
        }
      }
      break;
    case NEEL:
      for (let i = 0; i < n; ++i) {
        for (let j = 0; j < n; ++j) {
          spin[i][j] = (i + j) % 2; 
        }
      }
      break;
    case ZERO:
      break;
  }
}

function setupFlippabilityCharge() {
  if (isPeriodicBC) {
    np = n;
  } else {
    np = n - 1;
  }
  flippability = Array(np).fill().map(() => Array(np).fill(1));
  charge = Array(np).fill().map(() => Array(np).fill(1));
}

function changeInitialState() {
  switch (selectInitialState.value()) {
    case "Zero":
      initialState = ZERO;
      break;
    case "Random":
      initialState = RANDOM;
      break;
    case "Neel":
      initialState = NEEL;
      break;
  }
  setupSpin();
}

function changeBC() {
  isPeriodicBC = !isPeriodicBC;
  setupFlippabilityCharge();
}

function changeSize() {
  let size = int(selectSize.value());
  n = size;
  if ((size % 2) === 1) {
    selectInitialState.disable("Neel");
    selectInitialState.selected("Zero");
  } else {
    let neelOption = select("option[value=Neel]");
    neelOption.removeAttribute("disabled");
  }
  setupSpin();
  setupFlippabilityCharge();
  
  let w = (n - 1) * xSpacing + 2 * xOffset;
  let h = (n - 1) * ySpacing + 2 * yOffset;
  resizeCanvas(w, h);
}

function flipAllSpins() {
  for (let i = 0; i < n; ++i) {
    for (let j = 0; j < n; ++j) {
      flipSpin(i, j);
    }
  }
}

function calculateCharge() {
  for (let i = 0; i < np; ++i) {
    for (let j = 0; j < np; ++ j) {
      charge[i][j] = spin[i][j] + spin[(i + 1) % n][j] + spin[i][(j + 1) % n] + spin[(i + 1) % n][(j + 1) % n] - 2;
    }
  }
}

function calculateFlippability() {
  for (let i = 0; i < np; ++i) {
    for (let j = 0; j < np; ++ j) {
      let isDiagonalSame = (spin[i][j] === spin[(i + 1) % n][(j + 1) % n]) && (spin[(i + 1) % n][j] === spin[i][(j + 1) % n]);
      let isSideDifferent = (spin[i][j] !== spin[i][(j + 1) % n]) && (spin[i][j] !== spin[(i + 1) % n][j]);
      if (isDiagonalSame && isSideDifferent) {
        flippability[i][j] = 1;
      } else {
        flippability[i][j] = 0;
      }
    }
  }
}

function drawSpins() {
  stroke(0);
  strokeWeight(3);
  fill(255);
  textAlign(CENTER, CENTER);
  for (let i = 0; i < n; ++i) {
    for (let j = 0; j < n; ++j) {
      text(str(spin[i][j]), xOffset + i * xSpacing, yOffset + j * ySpacing);
    }
  }
  if (isPeriodicBC) {
    stroke(160);
    for (let i = - 1; i < n + 1; ++ i) {
      text(str(spin[(i + n) % n][n - 1]), xOffset + i * xSpacing, yOffset - ySpacing);
      text(str(spin[(i + n) % n][0]), xOffset + i * xSpacing, yOffset + n * ySpacing);
    }
    for (let j = 0; j < n; ++ j) {
      text(str(spin[n - 1][j]), xOffset - xSpacing, yOffset + j * ySpacing);
      text(str(spin[0][j]), xOffset + n * xSpacing, yOffset + j * ySpacing);
    }
  }
}

function drawPlaquettes() {
  rectMode(CENTER);
  strokeWeight(0);
  for (let i = 0; i < np; ++i) {
    for (let j = 0; j < np; ++j) {
      if (flippability[i][j] === 1) {
        fill(flippableColor);
      } else {
        fill(unflippableColor);
      }
      rect(xOffset + i * xSpacing + 0.5 *  xSpacing, yOffset + j * ySpacing + 0.5 * ySpacing, xSpacing * 0.5, ySpacing * 0.5);
    }
  }
  if (isPeriodicBC) {
    for (let i = -1; i < np; ++i) {
      if (flippability[(i + np) % np][np - 1] === 1) {
        fill(flippableColor);
      } else {
        fill(unflippableColor);
      }
      rect(xOffset + i * xSpacing + 0.5 *  xSpacing, yOffset - ySpacing + 0.5 * ySpacing, xSpacing * 0.5, ySpacing * 0.5);
    }
    for (let j = 0; j < np; ++j) {
      if (flippability[np - 1][j] === 1) {
        fill(flippableColor);
      } else {
        fill(unflippableColor);
      }
      rect(xOffset - xSpacing + 0.5 *  xSpacing, yOffset + j * ySpacing + 0.5 * ySpacing, xSpacing * 0.5, ySpacing * 0.5);
    }
  }
}

function drawCharges() {
  strokeWeight(0);
  textStyle(BOLD);
  if (isPeriodicBC && (n % 2 === 1)) {
    stroke(plainChargeColor);
    fill(plainChargeColor);
    for (let i = -1; i < np; ++ i) {
      for (let j = -1; j < np; ++ j) {
        let plusSign = charge[(i + np) % np][(j + np) % np] > 0 ? "+" : "";
        text(plusSign + str(charge[(i + np) % np][(j + np) % np]), xOffset + i * xSpacing + 0.5 * xSpacing, yOffset + j * ySpacing + 0.5 * ySpacing);
      }
    }
  } else {
    for (let k = 0; k < 4; ++k) {
      let p = Math.floor(k / 2);
      let q = k % 2;
      stroke(chargeColors[k]);
      fill(chargeColors[k]);
      for (let i = p; i < np; i += 2) {
        for (let j = q; j < np; j += 2) {
          let plusSign = charge[i][j] > 0 ? "+" : "";
          text(plusSign + str(charge[i][j]), xOffset + i * xSpacing + 0.5 * xSpacing, yOffset + j * ySpacing + 0.5 * ySpacing);
        }
      }
      if (isPeriodicBC) {
        for (let i = -1 * p; i < np; i += 2) {
          let plusSign = charge[(i + np) % np][np - 1] > 0 ? "+" : "";
          text(plusSign + str(charge[(i + np) % np][np - 1]), xOffset + i * xSpacing + 0.5 * xSpacing, yOffset - ySpacing + 0.5 * ySpacing);
        }
        for (let j = q; j < np; j += 2) {
          let plusSign = charge[np - 1][j] > 0 ? "+" : "";
          text(plusSign + str(charge[np - 1][j]), xOffset - xSpacing + 0.5 * xSpacing, yOffset + j * ySpacing + 0.5 * ySpacing);
        }
      }
    }
  }
}

function calculateMouseRegion(x, y) {
  let lowestPlaquetteRegionI;
  let lowestPlaquetteRegionJ;
  if (isPeriodicBC) {
    lowestPlaquetteRegionI = -1;
    lowestPlaquetteRegionJ = -1;
  } else {
    lowestPlaquetteRegionI = 1;
    lowestPlaquetteRegionJ = 1;
  }
  // console.log(lowestPlaquetteRegionI);
  let xRegion = Math.floor((x + 0.25 * xSpacing - xOffset) / xSpacing * 2);
  let yRegion = Math.floor((y + 0.25 * ySpacing - yOffset) / ySpacing * 2);
  // console.log("Mouse region: ", xRegion, yRegion);
  if ((xRegion >= 0) && (xRegion <= 2 * n - 2) && (xRegion % 2 === 0) && (yRegion >= 0) && (yRegion <= 2 * n - 2) && (yRegion % 2 === 0)) {
    mouseRegion = MOUSE_ON_SPIN;
    mouseSpinI = Math.floor(xRegion / 2);
    mouseSpinJ = Math.floor(yRegion / 2);
  } else if ((xRegion >= lowestPlaquetteRegionI) && (xRegion <= 2 * np - 1) && ((xRegion + 2) % 2 === 1) && (yRegion >= lowestPlaquetteRegionJ) && (yRegion <= 2 * np - 1) && ((yRegion + 2) % 2 === 1)) {
    mouseRegion = MOUSE_ON_PLAQUETTE;
    mousePlaquetteI = Math.floor((xRegion - 1) / 2);
    mousePlaquetteJ = Math.floor((yRegion - 1) / 2);
    // console.log("Plaquette index: ", mousePlaquetteI, mousePlaquetteJ);
  } else {
    mouseRegion = MOUSE_OUT_OF_RANGE;
  }
}

function setMouseShape() {
  switch (mouseRegion) {
    case MOUSE_ON_SPIN:
      cursor(HAND);
      stroke(0);
      strokeWeight(4);
      fill(255);
      text(str(spin[mouseSpinI][mouseSpinJ]), xOffset + mouseSpinI * xSpacing, yOffset + mouseSpinJ * ySpacing);
      break;
    case MOUSE_ON_PLAQUETTE:
      if (flippability[(mousePlaquetteI + np) % np][(mousePlaquetteJ + np) % np] == 1) {
        cursor(HAND);
        stroke(0);
        strokeWeight(2);
        noFill();
        rect(xOffset + mousePlaquetteI * xSpacing + 0.5 * xSpacing, yOffset + mousePlaquetteJ * ySpacing + 0.5 * ySpacing, xSpacing * 0.5, ySpacing * 0.5);
        if (isPeriodicBC) {
          stroke(160);
          if (mousePlaquetteI === -1) {
            rect(xOffset + (np - 1) * xSpacing + 0.5 * xSpacing, yOffset + mousePlaquetteJ * ySpacing + 0.5 * ySpacing, xSpacing * 0.5, ySpacing * 0.5);
          }
          if (mousePlaquetteI === np - 1) {
            rect(xOffset - xSpacing + 0.5 * xSpacing, yOffset + mousePlaquetteJ * ySpacing + 0.5 * ySpacing, xSpacing * 0.5, ySpacing * 0.5);
          }
          if (mousePlaquetteJ === -1) {
            rect(xOffset + mousePlaquetteI * xSpacing + 0.5 * xSpacing, yOffset + (np - 1) * ySpacing + 0.5 * ySpacing, xSpacing * 0.5, ySpacing * 0.5);
          }
          if (mousePlaquetteJ === np - 1) {
            rect(xOffset + mousePlaquetteI * xSpacing + 0.5 * xSpacing, yOffset - ySpacing + 0.5 * ySpacing, xSpacing * 0.5, ySpacing * 0.5);
          }
          if (mousePlaquetteI === -1 && mousePlaquetteJ === -1) {
            rect(xOffset + (np - 1) * xSpacing + 0.5 * xSpacing, yOffset + (np - 1) * ySpacing + 0.5 * ySpacing, xSpacing * 0.5, ySpacing * 0.5);
          }
          if (mousePlaquetteI === -1 && mousePlaquetteJ === np - 1) {
            rect(xOffset + (np - 1) * xSpacing + 0.5 * xSpacing, yOffset - ySpacing + 0.5 * ySpacing, xSpacing * 0.5, ySpacing * 0.5);
          }
          if (mousePlaquetteI === np && mousePlaquetteJ === -1) {
            rect(xOffset - xSpacing + 0.5 * xSpacing, yOffset + (np - 1) * ySpacing + 0.5 * ySpacing, xSpacing * 0.5, ySpacing * 0.5);
          }
          if (mousePlaquetteI === np && mousePlaquetteJ === np) {
            rect(xOffset - xSpacing + 0.5 * xSpacing, yOffset - ySpacing + 0.5 * ySpacing, xSpacing * 0.5, ySpacing * 0.5);
          }
        }
      }
      break;
    case MOUSE_OUT_OF_RANGE:
      cursor(ARROW);
  }
}


function draw() {
  background(backgroundColor);
  
  calculateCharge();
  calculateFlippability();
  
  drawSpins(); 
  drawPlaquettes();
  drawCharges();

  calculateMouseRegion(mouseX, mouseY);
  setMouseShape();
}

function flipSpin(i, j) {
  spin[i][j] = (spin[i][j] + 1) % 2;
}

function flipPlaquette(i, j) {
  spin[i][j] = (spin[i][j] + 1) % 2;
  spin[i][(j + 1) % n] = (spin[i][(j + 1) % n] + 1) % 2;
  spin[(i + 1) % n][j] = (spin[(i + 1) % n][j] + 1) % 2;
  spin[(i + 1) % n][(j + 1) % n] = (spin[(i + 1) % n][(j + 1) % n] + 1) % 2;
}

function mousePressed() {
  switch (mouseRegion) {
    case MOUSE_ON_SPIN:
      flipSpin(mouseSpinI, mouseSpinJ);
      break;
    case MOUSE_ON_PLAQUETTE:
      if (flippability[(mousePlaquetteI + np) % np][(mousePlaquetteJ + np) % np] === 1) {
        flipPlaquette((mousePlaquetteI + np) % np, (mousePlaquetteJ + np) % np);
      }
      break;
  }
}