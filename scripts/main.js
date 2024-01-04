GALLERY_SHOWN_CLASS = 'shown';
BODY_HIDE_SCROLL_CLASS = 'hide-scroll';

onload = (event) => {
  initGallery();
  initOccurrences();
};

function initGallery() {
  const galleryWrapper = document.querySelector('.gallery-wrapper');
  const closeGallery = () => {
    galleryWrapper.classList.remove(GALLERY_SHOWN_CLASS);
    document.body.classList.remove(BODY_HIDE_SCROLL_CLASS);
  };
  galleryWrapper.addEventListener('click', (event) => {
    // If click was outside of the images, close the gallery
    if(!event.target.closest('.image')) {
      closeGallery();
    }
  });
  document.addEventListener('keydown', function(event) {
    if (galleryWrapper.classList.contains(GALLERY_SHOWN_CLASS)
        && !document.querySelector('.simple-lightbox')
        && event.key === 'Escape') {
      closeGallery();
    }
  });
}

async function initOccurrences() {
  const navData = {};

  const timeline = document.querySelector('.timeline');
  const response = await fetch('./data.json5');
  const json5Text = await response.text();
  const data = JSON5.parse(json5Text);

  /* Sort data, newest first */
  const sortedOccurences = data.occurrences.sort((a, b) => {
    const dateA = new Date(a.date.year, a.date.month - 1, a.date.day);
    const dateB = new Date(b.date.year, b.date.month - 1, b.date.day);

    return dateB - dateA;
  });

  const printDate = (date) => {
    return `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
  }
  sortedOccurences.forEach((occurrence) => {
    const imagesArr = createImagesArr(occurrence);
    const html = `
      <h2 class="date">${printDate(occurrence.date)}</h2>
      <div class="images">
      <a class="image" href="${imagesArr[0].src}"><img src="${imagesArr[0].thumb}" alt="${imagesArr[0].alt}"></a>
      ${imagesArr.length > 1 ? '<div class="multi-shadow"></div><img class="multi" src="./multi-icon.svg">'  : ''}
      </div>
      <div class="descr">${occurrence.description}</div>
    `;
    const occurrenceDiv = document.createElement('div');
    occurrenceDiv.classList.add('occurrence');
    occurrenceDiv.dataset.year = occurrence.date.year;
    occurrenceDiv.dataset.month = occurrence.date.month;
    occurrenceDiv.id = 'occurrence-' + crypto.randomUUID();
    occurrence.id = occurrenceDiv.id;
    occurrenceDiv.innerHTML = html;

    timeline.append(occurrenceDiv);
    if(imagesArr.length > 1) {
      linkGallery(occurrence);
    } else {
      new SimpleLightbox(`#${occurrence.id} .image`, {overlayOpacity: 1});
    }

    let navData4Year;
    navData4Year = navData[occurrence.date.year];
    if(!navData4Year) {
      navData4Year = navData[occurrence.date.year] = new Set();
    }
    navData4Year.add(occurrence.date.month);
  });
  createNav(navData);
}

function createImagesArr(occurrence) {
  if(occurrence.imagesRange) {
    const imagesArr = [];
    for(let i=occurrence.imagesRange.start; i<=occurrence.imagesRange.end; i++) {
      const filename = `${occurrence.imagesRange.baseName}${i}.${occurrence.imagesRange.ext}`;
      imagesArr.push({
        thumb: `${occurrence.imagesRange.thumbFolder}/${filename}`,
        src: `${occurrence.imagesRange.srcFolder}/${filename}`,
        alt: filename
      });
    }
    return imagesArr;
  } else {
    return occurrence.images;
  }
}

function linkGallery(occurrence) {
  document.querySelector(`#${occurrence.id} .images`).addEventListener('click', (event) => {
    event.preventDefault();

    const galleryWrapper = document.querySelector('.gallery-wrapper');
    galleryWrapper.querySelector('.gallery').innerHTML = `
      ${createImagesArr(occurrence).reduce((acc, value) =>
        acc + `<a class="image" href="${value.src}"><img src="${value.thumb}" alt="${value.alt}"></a>`
      , '')}
    `;
    galleryWrapper.classList.add(GALLERY_SHOWN_CLASS);
    document.body.classList.add(BODY_HIDE_SCROLL_CLASS);
    // The browsers remembers the scroll position of the last gallery. Make it start from the top.
    galleryWrapper.scrollTop = 0

    /*
     * waterfall only works when all the images have loaded and have known sizes.
     * Not waiting for them to all load leads to them being stacked with absolute positioning because <img> has a height of 0 initially
     */
    const allImages = document.querySelectorAll('.gallery img');
    let imagesLoaded = 0;
    allImages.forEach(img => img.addEventListener('load', () => {
      imagesLoaded++;
      if(imagesLoaded == allImages.length) {
        console.log('all loaded');
        waterfall(document.querySelector('.gallery'));
      }
    }));

    // A new lightbox per generated gallery. Does not open a lightbox but maps it to the click event on the images
    new SimpleLightbox(`.gallery .image`, {overlayOpacity: 1})
  });
}

function createNav(navData) {
  const navElem = document.querySelector('header nav');
  const monthToString = (monthNum) => {
    switch (monthNum) {
      case 1: return 'Jan';
      case 2: return 'Feb';
      case 3: return 'Mar';
      case 4: return 'Apr';
      case 5: return 'May';
      case 6: return 'Jun';
      case 7: return 'Jul';
      case 8: return 'Aug';
      case 9: return 'Sep';
      case 10: return 'Oct';
      case 11: return 'Nov';
      case 12: return 'Dec';
    }
  }
  navElem.innerHTML = Object.keys(navData).reverse().reduce(
    (navHtml, year) => navHtml + `
      ${[...navData[year]].reduce(
        (monthsHtml, month) => monthsHtml + 
          `<a class="month" data-year="${year}" data-month="${month}">${monthToString(month)}</a>`
      , '')}
      <span class="year">${year}</span>
    `
  ,'');

  const getOccurrenceByDate = (year, month) => {
    return document.querySelector(`.occurrence[data-year="${year}"][data-month="${month}"]`);
  };
  navElem.querySelectorAll('.month').forEach(monthLink => 
    monthLink.addEventListener('click', () =>
      getOccurrenceByDate(monthLink.dataset.year, monthLink.dataset.month).scrollIntoView()
  ));
}