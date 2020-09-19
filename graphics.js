
let response;
let size = 5;
let board = new Board(size, size);
const R = 20;
const D = 2 * R;
  let width = board.width * D + D;
  let height = board.height * D + D;

function setup() {
  placeColor = 1
  bg = board.color

    let canv = createCanvas(width, height).mouseClicked(place);
    canv.addClass('copyable')
    canv.parent("board")
    ellipseMode(RADIUS)
    strokeCap(PROJECT)
    textSize(18)
    textAlign(CENTER, CENTER)

    copyButton = createButton('Save & Copy');
    copyButton.position(19, 19);
    copyButton.mousePressed(saveToServer);

    saveButton = createButton('Download to Device');
    saveButton.position(117, 19);
    saveButton.mousePressed(saveToFile);

    fiveFive = createButton('5 x 5');
    fiveFive.position(19,50);
    fiveFive.mousePressed(resizeBoard5);

    sevenSeven = createButton('7 x 7');
    sevenSeven.position(19, 75);
    sevenSeven.mousePressed(resizeBoard7);

    nineNine = createButton('9 x 9');
    nineNine.position(19, 100);
    nineNine.mousePressed(resizeBoard9);

    buttonGreen = createButton("Green");
    buttonGreen.position(19, 150);
    buttonGreen.mousePressed(setGreen);

    buttonRed = createButton("Red");
    buttonRed.position(19, 175);
    buttonRed.mousePressed(setRed);

    buttonGray = createButton("Gray");
    buttonGray.position(19, 200);
    buttonGray.mousePressed(setGray);
}

function setSize(newSize) {
  size = newSize;
  resizeCanvas((size * D + D), (size * D + D))
  board = new Board(size, size);
  width = board.width * D + D;
  height = board.height * D + D;
}



function draw() {
    background(board.color)

    stroke(0)
    strokeWeight(2)

    translate(D, D)

    for (let x = 0; x < board.width; x ++) {
        line(x * D, 0, x * D, (board.height - 1) * D)
    }

    for (let y = 0; y < board.height; y ++) {
        line(0, y * D, (board.width - 1) * D, y * D)
    }

    noStroke()

    for (let x = 0; x < board.width; x ++) {
        for (let y = 0; y < board.height; y ++) {
            let node = board[x][y]
            if (node.color) {
                fill((node.color === -1) * 255)
                circle(x * D, y * D, R)
            }
        }
    }

    let x = floor(map(mouseX, R, width - R, 0, width, true))
    let y = floor(map(mouseY, R, height - R, 0, height, true))
    if (board[x] && board[x][y]) {
        let node = board[x][y]
        if (keyIsDown(90)) node.color = 1
        if (keyIsDown(88)) node.color = -1
        if (keyIsDown(67)) node.color = 0
    }

    textSize(25);
    textAlign(LEFT);
    if (board.id) {
      drawWords();
    }
}

function place() {
    let x = floor(map(mouseX, R, width - R, 0, board.width, true))
    let y = floor(map(mouseY, R, height - R, 0, board.height, true))
    if (board[x] && board[x][y]) {
        let node = board[x][y]
        if (keyIsDown(SHIFT)) node.color += 2
        else node.color += 1
        if (node.color > 1) node.color -= 3
    }
}

function keyPressed() {
    if (key == 'q') setGray();
    if (key == 'w') setGreen();
    if (key == 'e') setRed();

    if (key == 's') saveCanvas();
}

function resizeBoard5() {
  setSize(5);
}

function resizeBoard7() {
  setSize(7);
}

function resizeBoard9() {
  setSize(9);
}

function setGreen() {
  board.color = 'lime';
}

function setRed() {
  board.color = "red";
}

function setGray() {
  board.color = "gray";
}

function copyImage() {
  copyCanvasContentsToClipboard(document.querySelector(".copyable"), copiedText, onError);
}

function copiedText(data) {
  console.log("Copied!");

  let copiedText = createSpan('Copied to clipboard!');
    setTimeout(() => {  copiedText.remove(); }, 2000);
}

function onError(error) {
  console.log(error);
}

const scaleCanvas = (canvas, scale) => {
  const scaledCanvas = document.createElement('canvas');
  scaledCanvas.width = canvas.width * scale;
  scaledCanvas.height = canvas.height * scale;

  scaledCanvas
    .getContext('2d')
    .drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);

  return scaledCanvas;
};

function copyCanvasContentsToClipboard(canvas, onDone, onError) {
  scaleCanvas(canvas, .5).toBlob(function (blob) {
    let data = [new ClipboardItem({ 'image/png': blob })];

    navigator.clipboard.write(data).then(function () {
      onDone(data);
    }, function (err) {
      onError(err);
    })
  });
}


function saveToFile() {
  const canvas = scaleCanvas(document.querySelector(".copyable"), .5);

  saveCanvas(canvas, 'GoKoan', 'png');
}

function drawWords() {
  if (board.color == "lime") {
    fill(0);
  } else {
    fill("white");
  }

  text(board.id, -30, height - 55);
}

function saveToServer() {
  const data = {
    "board": {
      "size": board.size,
      "state": JSON.stringify(board)
    }
  };

  fetch("https://agile-sands-06400.herokuapp.com/api/v1/boards", {
    method: "post",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(res => res.json())
    .then(res => {
      if (res.errors) {
        console.log(res.errors)
      } else {
        updateBoard(res);
      }})
    .then( () => {
      setTimeout(() => {  copyImage() }, 100);
    }).catch(err => console.log(err))
}

$(document).ready(function() {
  $('form').on('submit', function(e){
    e.preventDefault();
    let id = document.getElementById('loadId').value;
    let url = "https://agile-sands-06400.herokuapp.com/api/v1/boards/" + id;

    fetch(url, {
      method: "get"
    }).then(res => res.json())
      .then(res => {
        if (res.errors) {
          console.log(res.errors)
        } else {
          updateBoard(res);
        }})

  });
});

function updateBoard(res) {

  console.log(res);

  if (size !== res.data.size) {
    size = res.data.size;
    setSize(size);
  }

  board = JSON.parse(res.data.state);
  board.id = res.data.id;
}
