'use strict';

function onInit() {
  gElCanvas = document.querySelector('.canvas');
  gCtx = gElCanvas.getContext('2d');
  addListeners();
  renderStickers();
  renderKeywords();
  renderGallery();
}

function renderGallery() {
  const imgs = getImgs();
  var strHtmls = `<div class="img-gallery" style="margin: auto;">
                    <input type="file" id="BtnUploadHidden" class="img-item file-input btn" name="image" onchange="onUploadImg(event)" style="display: none;"/>
                    <label for="BtnUploadHidden" class="btn-upload" >Upload an image</label>
                  </div>`;
  strHtmls += imgs
    .map((img) => {
      return `<div class="img-gallery">
                <img src="imgs/imgs-square/${img.url}" onclick="onImgSelect(${img.id})">
              </div>`;
    })
    .join('');

  const elGallery = document.querySelector('.images-container');
  elGallery.innerHTML = strHtmls;
}

function renderMyMemes() {
  const memes = getSavedMemes();
  let strHtmls;
  if (memes.length) {
    strHtmls = memes
      .map((meme) => {
        return `<div class="img-gallery" data-id="${meme.id}">
                <img src="${meme.src}" onclick="onOpenImgModal('${meme.src}', '${meme.id}')"/>
              </div>`;
      })
      .join('');
  } else {
    strHtmls = `No saved Memes ☹ `;
  }

  document.querySelector('.meme-container').innerHTML = strHtmls;
}

function renderKeywords() {
  const isViewAllKeys = document.querySelector('.btn-more').innerText === 'More...' ? false : true;
  const keywords = getKeywords(isViewAllKeys);

  let strHtmls = '';
  for (const word in keywords) {
    strHtmls += `
    <li class="keyword"><a href="#" style="font-size: ${keywords[word]}px; margin-right:20px;"
    onclick="onKeyFillter('${word}')">${word}</a></li>`;
  }

  document.querySelector('.keywords-container').innerHTML = strHtmls;
}

function onImgSelect(id) {
  document.querySelector('.tooltiptext').style.visibility = 'visible';
  setImg(id);
  _moveToEditorPage();
  renderCanvas();
}

function onOpenPage(page) {
  onToggleMenu();
  resetCanvas();
  _hideSections();
  switch (page) {
    case 'gallery':
      openGallery();
      break;
    case 'memes':
      openMemes();
      break;
    case 'about':
      openAbout();
      break;
  }
}

function openGallery() {
  document.querySelector('.gallery-container').classList.remove('none');
  document.querySelector('.main-nav .btn-gallery').classList.add('active');
}

function openMemes() {
  document.querySelector('.my-memes-container').classList.remove('none');
  document.querySelector('.main-nav .btn-memes').classList.add('active');
  renderMyMemes();
}

function openAbout() {
  document.querySelector('.about-container').classList.remove('none');
  document.querySelector('.main-nav .btn-about').classList.add('active');
}

function onSearch(ev) {
  ev.preventDefault();
  const elSearch = document.querySelector('input[name="search"]');
  fillterBySearch(elSearch.value);
  elSearch.value = '';
  renderKeywords();
  renderGallery();
}

function onKeyFillter(word) {
  fillterBySearch(word);
  renderKeywords();
  renderGallery();
}

function onToggleMore(elBtn) {
  elBtn.innerText = elBtn.innerText === 'More...' ? 'Less...' : 'More...';
  renderKeywords();
}

function onToggleMenu() {
  if (window.innerWidth > 820) document.body.classList.remove('menu-open');
  else document.body.classList.toggle('menu-open');
  const elBtnMenu = document.querySelector('.btn-menu');
  elBtnMenu.innerText = document.body.classList.contains('menu-open')
    ? '✕'
    : '☰';
}

function onUploadImg(ev) {
  var reader = new FileReader();

  reader.onload = (event) => {
    var img = new Image();
    img.src = event.target.result;
    setImg(100, img.src);
    _moveToEditorPage();
    renderCanvas();
  };

  reader.readAsDataURL(ev.target.files[0]);
}

function onOpenImgModal(imgSrc, imgId) {
  const strHtml = `<div class="img-modal" data-id="${imgId}" onmouseleave="onLeaveModal(this)">
                      <div class="img-modal-container">
                        <button class="delete-meme" onclick="onDeleteMeme('${imgId}')">Delete</button>
                        <a
                        class="btn-download"
                        href="#"
                        onclick="onDownloadImg(this, '${imgSrc}', '${imgId}')"
                        download="my-meme.jpg"
                        ><button class="btn">Download</button></a
                      >
                      </div>
                    </div>`;

  const elContainer = document.querySelector(
    `.img-gallery[data-id="${imgId}"]`
  );
  elContainer.style.position = 'relative';
  elContainer.innerHTML += strHtml;
}

function onDownloadImg(elLink, src, id) {
  elLink.href = src;
  document.querySelector(`.img-modal[data-id="${id}"]`).style.display = 'none';
}

function onLeaveModal(el) {
  el.style.display = 'none';
}

function onDeleteMeme(memeId) {
  deleteMeme(memeId);
  renderMyMemes();
}

function _moveToEditorPage() {
  document.querySelector('.gallery-container').classList.add('none');
  document.querySelector('.editor-container').classList.remove('none');
}

function _hideSections() {
  // sections
  document.querySelector('.gallery-container').classList.add('none');
  document.querySelector('.editor-container').classList.add('none');
  document.querySelector('.my-memes-container').classList.add('none');
  document.querySelector('.about-container').classList.add('none');

  // nav buttons
  document.querySelector('.main-nav .btn-gallery').classList.remove('active');
  document.querySelector('.main-nav .btn-memes').classList.remove('active');
  document.querySelector('.main-nav .btn-about').classList.remove('active');
}
