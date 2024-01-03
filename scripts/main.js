onload = (event) => {
  initOccurrences();
};

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
    let imgCount = 1;
    const html = `
      <h2 class="date">${printDate(occurrence.date)}</h2>
      <div class="images">
        ${occurrence.images.reduce((acc, value) => acc + 
          `<a class="image" href="${value.src}"><img loading="lazy" class="image-${imgCount++}" src="${value.src}" alt="${value.alt}"></a>`
          , '')}
      </div>
      <div class="descr">${occurrence.description}</div>
    `;
    const occurrenceDiv = document.createElement('div');
    occurrenceDiv.classList.add('occurrence');
    occurrenceDiv.dataset.year = occurrence.date.year;
    occurrenceDiv.dataset.month = occurrence.date.month;
    occurrenceDiv.id = 'occurrence-' + crypto.randomUUID();
    occurrenceDiv.innerHTML = html;

    timeline.append(occurrenceDiv);

    let navData4Year;
    navData4Year = navData[occurrence.date.year];
    if(!navData4Year) {
      navData4Year = navData[occurrence.date.year] = new Set();
    }
    navData4Year.add(occurrence.date.month);
  });
  createNav(navData);
  initLightbox();
}

function getOccurrenceByDate(year, month) {
  return document.querySelector(`.occurrence[data-year="${year}"][data-month="${month}"]`);
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

  navElem.querySelectorAll('.month').forEach(monthLink => 
    monthLink.addEventListener('click', () =>
      getOccurrenceByDate(monthLink.dataset.year, monthLink.dataset.month).scrollIntoView()
  ));
}


function initLightbox() {
  document.querySelectorAll('.occurrence').forEach(occurrenceElem => {
    const id = occurrenceElem.id;
    new SimpleLightbox(`#${id} .image`, {overlayOpacity: 1});
  });
}