let lightbox;
onload = (event) => {
  initLightbox();
};


function initLightbox() {
  lightbox = new Lightbox();
  document.querySelectorAll('.occurrence .img').forEach(
    (imgWrapper) => imgWrapper.addEventListener('click', () => {
      lightbox.open(imgWrapper.querySelector('img'));
    })
  );
}

class Lightbox {
  constructor() {
    this.OPEN_CLASS = 'open';
    this._lightbox = document.querySelector('.lightbox');
    this._lightbox.addEventListener('click', this.close.bind(this));
  }
  
  get container() {
    return this._lightbox.querySelector('.container');
  }
  
  open(sourceImg) {
    const container = this.container;
    container.innerHTML = '';
    container.append(sourceImg.cloneNode());
    this._lightbox.classList.add(this.OPEN_CLASS);
  }
  
  close() {
    this._lightbox.classList.remove(this.OPEN_CLASS);
  }
}