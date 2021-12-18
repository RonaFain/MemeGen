'use strict';
const gStickers = [
  { id: 1, src: 'imgs/stickers/flirty-smiley.png' },
  { id: 2, src: 'imgs/stickers/nerd-emoji.png' },
  { id: 3, src: 'imgs/stickers/pirate-emoji.png' },
  { id: 4, src: 'imgs/stickers/smiley-emoji.png' },
  { id: 5, src: 'imgs/stickers/smiley-face-tears.png' },
  { id: 6, src: 'imgs/stickers/smiley-thumb.png' },
];
const gKeywords = {
  all: 25,
  funny: 15,
  animal: 12,
  akward: 17,
  happy: 9,
  angry: 12,
  people: 16,
  baby: 11,
  politics: 17,
  cute: 18,
  crazy: 15,
};
const gTouchEvs = ['touchstart', 'touchmove', 'touchend'];
var gImgs = [
  { id: 1, url: '1.jpg', keywords: ['politics', 'angry', 'people'] },
  { id: 2, url: '2.jpg', keywords: ['animal', 'cute', 'happy'] },
  { id: 3, url: '3.jpg', keywords: ['baby', 'cute', 'animal'] },
  { id: 4, url: '4.jpg', keywords: ['animal', 'cute'] },
  { id: 5, url: '5.jpg', keywords: ['baby', 'happy', 'funny'] },
  { id: 6, url: '6.jpg', keywords: ['people', 'crazy'] },
  { id: 7, url: '7.jpg', keywords: ['funny', 'baby', 'cute', 'happy'] },
  { id: 8, url: '8.jpg', keywords: ['funny', 'people', 'crazy'] },
  { id: 9, url: '9.jpg', keywords: ['funny', 'baby', 'cute', 'happy'] },
  { id: 10, url: '10.jpg', keywords: ['politics', 'happy', 'people'] },
  { id: 11, url: '11.jpg', keywords: ['akward', 'funny', 'people'] },
  { id: 12, url: '12.jpg', keywords: ['people', 'crazy', 'sad', 'akward'] },
  { id: 13, url: '13.jpg', keywords: ['people', 'happy'] },
  { id: 14, url: '14.jpg', keywords: ['people', 'crazy', 'angry'] },
  { id: 15, url: '15.jpg', keywords: ['crazy', 'people'] },
  { id: 16, url: '16.jpg', keywords: ['funny', 'happy', 'people'] },
  { id: 17, url: '17.jpg', keywords: ['politics', 'crazy', 'angry'] },
  { id: 18, url: '18.jpg', keywords: ['funny', 'happy'] },
];
var gMeme = {
  selectedImgId: 0,
  selectedLineIdx: 0,
  selectedStickerIdx: 0,
  lines: [],
  stickers: [],
};
const STORAGE_KEY = 'memeDB';
const STICKERS_SIZE = 3;
var gMemes = [];
var gCurrLineIdx = 0;
var gCurrStickerIdx = 0;
var gFillterWord = 'all';
var gStickerPageIdx = 0;

function getMeme() {
  return gMeme;
}

function getKeywords(isAllKeys) {
  if (isAllKeys) return gKeywords;
  else {
    const { all, funny, animal, akward, happy, angry } = gKeywords;
    return { all, funny, animal, akward, happy, angry };
  }
}

function getSavedMemes() {
  gMemes = loadFromStorage(STORAGE_KEY);
  if (!gMemes) gMemes = [];
  return gMemes;
}

function getImg(meme) {
  return gImgs.find((img) => img.id === meme.selectedImgId);
}

function getImgs() {
  if (gFillterWord === 'all') return gImgs;
  return gImgs.filter((img) => img.keywords.includes(gFillterWord));
}

function getLine() {
  return gMeme.lines[gCurrLineIdx];
}

function getLines() {
  return gMeme.lines;
}

function getMemeStickers() {
  return gMeme.stickers;
}

function getSticker() {
  return gMeme.stickers[gCurrStickerIdx];
}

function setLineTxt(txt) {
  const line = getLine();
  if (!line) return;
  line.txt = txt;
}

function setImg(id, src) {
  if (id === 100) {
    id = makeId();
    gImgs.push({ id, url: src, keywords: ['upload'] });
  }
  gMeme.selectedImgId = id;
}

function setLineDrag(isDrag) {
  const line = getLine();
  if (!line) return;
  line.isDrag = isDrag;
}

function setStickerDrag(isDrag) {
  const sticker = getSticker();
  if (!sticker) return;
  sticker.isDrag = isDrag;
}

function changeColor(type, color) {
  if (type === 'font') gMeme.lines[gCurrLineIdx].color = color;
  else gMeme.lines[gCurrLineIdx].stroke = color;
}

function changeFontSize(diff) {
  const line = getLine();
  line.size += diff;
}

function changeFontFamily(font) {
  const line = getLine();
  if (!line) return;
  line.font = font;
}

function moveLine(diff, dir) {
  const line = getLine();
  line.pos[dir] += diff;
}

function moveSticker(diff, dir) {
  const sticker = getSticker();
  sticker.pos[dir] += diff;
}

function changeLine() {
  const lines = getLines();
  if (!lines.length) return;
  if (gMeme.selectedLineIdx + 1 === lines.length) gMeme.selectedLineIdx = 0;
  else gMeme.selectedLineIdx++;

  _updateLineIdx(gMeme.selectedLineIdx);
  return lines[gCurrLineIdx];
}

function changeAlign(alignDir) {
  const line = getLine();
  line.align = alignDir;

  switch (alignDir) {
    case 'left':
      line.pos.x = 0;
      break;
    case 'center':
      line.pos.x = gElCanvas.width / 2;
      break;
    case 'right':
      line.pos.x = gElCanvas.width;
      break;
  }
}

function addLine(font) {
  const lines = getLines();
  const numNewLine = lines.length + 1;
  const newLine = _createLine(font, numNewLine);
  gMeme.lines.push(newLine);
  _updateLineIdx(gMeme.lines.length - 1);
}

function addSticker(id, src) {
  const newSticker = _createSticker(id, src);
  gMeme.stickers.push(newSticker);
  _updateStickerIdx(gMeme.stickers.length - 1);
  return newSticker;
}

function removeLine() {
  const lines = getLines();
  if (!lines.length) return;
  lines.splice(gCurrLineIdx, 1);
  _updateLineIdx(0);
}

function removeSticker() {
  const stickers = getMemeStickers();
  if(!stickers) return;
  stickers.splice(gCurrStickerIdx, 1);
  _updateStickerIdx(0);
}

function resetCanvas() {
  _updateLineIdx(-1); // help clear the canvas
  _updateStickerIdx(-1);
  gMeme.selectedImgId = -1;
  gMeme.lines = [];
  gMeme.stickers = [];
}

function fillterBySearch(word) {
  gFillterWord = word;
  if (word !== 'all') {
    gKeywords[word]++;
  }
}

function getEvPos(ev) {
  var pos = {
    x: ev.offsetX,
    y: ev.offsetY,
  };
  if (gTouchEvs.includes(ev.type)) {
    ev.preventDefault();
    ev = ev.changedTouches[0];
    pos = {
      x: ev.pageX - ev.target.offsetLeft,
      y: ev.pageY - ev.target.offsetTop,
    };
  }
  return pos;
}

function isLineClicked(clickedPos) {
  const lines = getLines();
  const clickedLineIdx = lines.findIndex((line) => {
    const lineWidth = gCtx.measureText(line.txt).width;
    const lineHeight = line.size;
    return (
      clickedPos.x >= line.pos.x - lineWidth / 2 - 10 &&
      clickedPos.x <= line.pos.x + lineWidth + 20 &&
      clickedPos.y >= line.pos.y - 10 &&
      clickedPos.y <= line.pos.y + lineHeight + 20
    );
  });
  if (clickedLineIdx !== -1) {
    _updateLineIdx(clickedLineIdx);
    return true;
  }
  return false;
}

function isStickerClicked(clickedPos) {
  const stickers = getMemeStickers();
  const clickedStickerIdx = stickers.findIndex((sticker) => {
    const stickerWidth = 50; // I choose 50px on drawImg
    return (
      clickedPos.x >= sticker.pos.x - stickerWidth / 2 &&
      clickedPos.x <= sticker.pos.x + stickerWidth / 2 &&
      clickedPos.y >= sticker.pos.y - stickerWidth / 2 &&
      clickedPos.y <= sticker.pos.y + stickerWidth / 2
    );
  });
  if (clickedStickerIdx !== -1) {
    _updateStickerIdx(clickedStickerIdx);
    return true;
  }
  return false;
}

function saveMeme(src) {
  const id = makeId();
  gMemes.push({ id, src });
  _saveMemesToStorage();
}

function deleteMeme(id) {
  const memeIdx = gMemes.findIndex((meme) => meme.id === id);
  gMemes.splice(memeIdx, 1);
  _saveMemesToStorage();
}

function getStickers() {
  const startIdx = gStickerPageIdx * STICKERS_SIZE;
  return gStickers.slice(startIdx, startIdx + STICKERS_SIZE);
}

function setStickersPage(diff) {
  gStickerPageIdx += diff;
  if (gStickerPageIdx < 0) {
    gStickerPageIdx = Math.ceil(gStickers.length / STICKERS_SIZE) - 1;
  } else if (gStickerPageIdx * STICKERS_SIZE >= gStickers.length)
    gStickerPageIdx = 0;
}

function doUploadImg(imgDataUrl, onSuccess) {
  const formData = new FormData();
  formData.append('img', imgDataUrl);

  fetch('//ca-upload.com/here/upload.php', {
    method: 'POST',
    body: formData,
  })
    .then((res) => res.text())
    .then((url) => {
      onSuccess(url);
    })
    .catch((err) => {
      console.error(err);
    });
}

function _saveMemesToStorage() {
  saveToStorage(STORAGE_KEY, gMemes);
}

function _updateLineIdx(idx) {
  gCurrLineIdx = idx;
  gMeme.selectedLineIdx = gCurrLineIdx;
}

function _updateStickerIdx(idx) {
  gCurrStickerIdx = idx;
  gMeme.selectedStickerIdx = gCurrStickerIdx;
}

function _createLine(font, numNewLine) {
  const newPos = { x: gElCanvas.width / 2, y: gElCanvas.height / 2 };
  // check if the line is first or second
  if (numNewLine === 1) newPos.y = 50;
  else if (numNewLine === 2) newPos.y = gElCanvas.height - 80;

  return {
    txt: '',
    size: 40,
    align: 'center',
    color: 'black',
    stroke: 'black',
    font,
    pos: { x: newPos.x, y: newPos.y },
    isDrag: false,
  };
}

function _createSticker(id, src) {
  const newPos = { x: gElCanvas.width / 2, y: gElCanvas.height / 2 };
  return {
    id,
    src,
    size: 20,
    pos: { x: newPos.x, y: newPos.y },
    isDrag: false,
  };
}
