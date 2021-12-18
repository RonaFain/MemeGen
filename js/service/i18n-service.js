'use strict';

var gTrans = {
    UNKNOWN: {
        en: 'UNKNOWN',
        he: 'לא הוגדר',
    },
    'nav-gallery': {
        en: 'Gallery',
        he: 'גלריה'
    },
    'nav-memes': {
        en: 'Memes',
        he: 'תמונות שלי',
    },
    'nav-about': {
        en: 'About',
        he: 'אודות',
    },
    'footer-copyright': {
        en: 'all rights reserved 2021 ©',
        he: '© הזכויות שמורות '
    },
    'about-title': {
        en: 'Hello !!',
        he: 'שלום !!',
    },
    'about-body': {
        en: 'This website created by Rona Fainshtein',
        he: 'האתר נוצר ע"י רונה פיינשטיין',
    },
    'contact-title': {
        en: 'Rona Fainshtein',
        he: 'רונה פיינשטיין',
    },
    'contact-body': {
        en: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquid nulla voluptatum sunt commodi quo asperiores porro ex, nam itaque at.',
        he: 'בלה בלה בלה בלה בלה בלה בלה בלה בלה בלה בלה בלה בלה בלה בלה בלה בלה בלה בלה בלה בלה בלה בלה בלה בלה ',
    },
    'upload-img-text': {
        en: 'Upload an image',
        he: 'העלה תמונה'
    },
    'search-placeholder': {
        en: 'Enter search keyword',
        he: 'הקלד מילת חיפוש'
    },
    tooltip: {
        en: 'First: add a new line',
        he: 'תחילה: הוסף שורה חדשה'
    },
    'btn-save': {
        en: 'Save',
        he: 'שמור'
    },
    'btn-download': {
        en: 'Download',
        he: 'הורד'
    },
    'btn-share': {
        en: 'Share',
        he: 'שתף'
    },
    'btn-delete-sticker': {
        en: 'Delete sticker',
        he: 'מחק מדבקה'
    },
    'btn-delete': {
        en: 'Delete',
        he: 'מחק'
    },
    'modal-text': {
        en: 'Are you sure you want to save this meme?',
        he: 'האם אתה בטוח שברצונך למחוק?'
    },
    'btn-yes': {
        en: 'yes',
        he: 'כן'
    },
    'btn-no': {
        en: 'no',
        he: 'לא'
    }
}

const DEFAULT_LANG = 'en';
var gCurrLang = DEFAULT_LANG;

function setLang(lang) {
  gCurrLang = lang;
}

function doTrans() {
  const els = document.querySelectorAll('[data-trans]');

  els.forEach((el) => {
    const transKey = el.dataset.trans;
    console.log('tranKey', transKey);
    if (el.nodeName === 'INPUT') {
      el.placeholder = getTrans(transKey);
    } else {
      el.innerText = getTrans(transKey);
    }
  });
}

function getTrans(transKey) {
  const tranLangsMap = gTrans[transKey];
  if (!tranLangsMap) return gTrans['UNKNOWN'][gCurrLang];

  const word = tranLangsMap[gCurrLang];
  
  if (!word) return tranLangsMap[DEFAULT_LANG];
  return word;
}
