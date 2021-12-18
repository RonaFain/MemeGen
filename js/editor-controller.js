'use strict';

var gElCanvas;
var gCtx;
var gStartPos;
var gIsMemeSave = false;

function addListeners() {
  addMouseListeners();
  addTouchListeners();
  window.addEventListener('resize', () => {
    // resizeCanvas();
    renderCanvas();
  });
}

function resizeCanvas() {
  const elContainer = document.querySelector('.canvas-container');
  gElCanvas.width = elContainer.offsetWidth;
  gElCanvas.height = elContainer.offsetHeight;
}

function addMouseListeners() {
  gElCanvas.addEventListener('mousemove', onMove);
  gElCanvas.addEventListener('mousedown', onDown);
  gElCanvas.addEventListener('mouseup', onUp);
}

function addTouchListeners() {
  gElCanvas.addEventListener('touchmove', onMove);
  gElCanvas.addEventListener('touchstart', onDown);
  gElCanvas.addEventListener('touchend', onUp);
}

function onDown(ev) {
  const pos = getEvPos(ev);
  const isStickerClick = isStickerClicked(pos);
  const isLineClick = isLineClicked(pos);
  if (!isStickerClick && !isLineClick) return;
  if (isLineClick) setLineDrag(true);
  else setStickerDrag(true);
  gStartPos = pos;
  gElCanvas.style.cursor = 'grab';
  renderTextInput();
  renderCanvas();
}

function onUp() {
  setLineDrag(false);
  setStickerDrag(false);
  gElCanvas.style.cursor = 'grab';
}

function onMove(ev) {
  const line = getLine();
  const sticker = getSticker();
  if ((!line || !line.isDrag) && (!sticker || !sticker.isDrag)) return;
  const pos = getEvPos(ev);
  const dx = pos.x - gStartPos.x;
  const dy = pos.y - gStartPos.y;
  if (line && line.isDrag) {
    moveLine(dx, 'x');
    moveLine(dy, 'y');
  } else {
    moveSticker(dx, 'x');
    moveSticker(dy, 'y');
  }
  gElCanvas.style.cursor = 'grabbing';
  gStartPos = pos;
  renderCanvas();
}

function renderCanvas() {
  const meme = getMeme();
  const img = new Image();
  const selectedImg = getImg(meme);
  if (!selectedImg) return;
  const uploadImg = selectedImg.keywords.includes('upload');
  img.src = uploadImg
    ? `${selectedImg.url}`
    : `imgs/imgs-square/${selectedImg.url}`;
  img.onload = () => {
    gCtx.drawImage(img, 0, 0, gElCanvas.width, gElCanvas.height);
    drawText();
    if (!gIsMemeSave) {
      drawBorder();
      drawStickerBorder();
    }
    renderTextInput();
    renderMemeStickers();
    gCtx.save();
  };
}

function renderTextInput() {
  const line = getLine();
  if (!line) document.querySelector('input[name="line"]').value = '';
  else document.querySelector('input[name="line"]').value = line.txt;
}

function renderMemeStickers() {
  const stickers = getMemeStickers();
  stickers.forEach((sticker) => {
    const img = new Image();
    img.src = sticker.src;
    gCtx.drawImage(img, sticker.pos.x, sticker.pos.y, 50, 50);
  });
}

function renderStickers() {
  const stickers = getStickers();
  const strHtmls = stickers.map((sticker) => {
    return `<div class="sticker" onclick="onAddSticker('${sticker.id}', '${sticker.src}')"><img src="${sticker.src}" style="width: 50px; height: 50px;" /></div>`;
  });

  const elContainer = document.querySelector('.stickers-container');
  elContainer.innerHTML = strHtmls.join('');
}

function drawText() {
  const lines = getLines();
  if (!lines) return;
  lines.forEach((line) => {
    const txt = line.txt;
    gCtx.lineWidth = 2;
    gCtx.textBaseline = 'top';
    gCtx.textAlign = `${line.align}`;
    document.fonts.ready.then(() => {
      gCtx.font = `${line.size}px ${line.font}`;
      gCtx.fillStyle = line.color;
      gCtx.strokeStyle = line.stroke;
      gCtx.fillText(txt, line.pos.x, line.pos.y);
      gCtx.strokeText(txt, line.pos.x, line.pos.y);
    });
  });
}

function drawBorder() {
  const line = getLine();
  if (!line) return;
  gCtx.beginPath();
  gCtx.rect(
    line.pos.x - gCtx.measureText(line.txt).width / 2 - 10,
    line.pos.y - 10,
    gCtx.measureText(line.txt).width + 20,
    line.size + 20
  );
  gCtx.lineWidth = 2;
  gCtx.strokeStyle = 'orange';
  gCtx.stroke();
  gCtx.closePath();
}

function drawStickerBorder() {
  const sticker = getSticker();
  if(!sticker) return;
  gCtx.beginPath();
  gCtx.strokeStyle = 'darkblue';
  gCtx.arc(sticker.pos.x + 25 , sticker.pos.y + 25 , 50, 0, 2 * Math.PI);
  gCtx.stroke();
  gCtx.closePath();
}

function onSetLineTxt(txt) {
  setLineTxt(txt);
  renderCanvas();
}

function onChangeColor(type, color) {
  changeColor(type, color);
  renderCanvas();
}

function onChangeFontSize(diff) {
  changeFontSize(diff);
  renderCanvas();
}

function onChangeFontFamily(font) {
  changeFontFamily(font);
  renderCanvas();
}

function onChangeLine() {
  const line = changeLine();
  onSetLineTxt(line.txt);
  renderCanvas();
}

function onMoveLine(direction) {
  const diff = direction === 'up' ? -5 : 5;
  moveLine(diff, 'y');
  renderCanvas();
}

function onAddLine() {
  document.querySelector('.tooltiptext').style.visibility = 'hidden';
  const font = document.querySelector('.select-font-family').value;
  addLine(font);
  document.querySelector('input[name="line"]').focus();
  renderCanvas();
}

function onRemoveLine() {
  removeLine();
  renderCanvas();
}

function onRemoveSticker() {
  removeSticker();
  renderCanvas();
}

function onChangeAlign(direction) {
  changeAlign(direction);
  renderCanvas();
}

function onAddSticker(id, src) {
  document.querySelector('.btn-remove-sticker').style.display = 'block';
  addSticker(id, src);
  renderCanvas();
}

function onSetStickersPage(diff) {
  setStickersPage(diff);
  renderStickers();
}

function onSaveMeme() {
  gIsMemeSave = true;
  renderCanvas();
  onToggleModal();
}

function onSaveModal() {
  const meme = gElCanvas.toDataURL();
  saveMeme(meme);
  gIsMemeSave = false;
  onToggleModal();
  // resetCanvas();
}

function onToggleModal() {
  const elModal = document.querySelector('.modal');
  elModal.style.display = elModal.style.display === 'none' ? 'block' : 'none';
}

// close modal by click on body
window.onclick = function (event) {
  const elModal = document.querySelector('.modal');
  if (event.target === elModal) {
    elModal.style.display = 'none';
  }
};

function onDownloadMeme(elLink) {
  const memeContent = gElCanvas.toDataURL();
  elLink.href = memeContent;
}

function onShareMeme() {
  const memeDateUrl = gElCanvas.toDataURL();

  function onSuccess(uploadedImgUrl) {
    const encodedUploadedImgUrl = encodeURIComponent(uploadedImgUrl);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${uploadedImgUrl}&t=${uploadedImgUrl}`
    );
  }
  doUploadImg(memeDateUrl, onSuccess);
}
