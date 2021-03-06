import {
  flags,
  translate,
  createElement,
  flagIsActive,
  flagGetImageUrl,
  isElementValid,
} from '../../core';

import DOM_ELEMENTS_FROM_POPUP from './createHtml';

const {
  DOM_POPUP,
  DOM_POPUP_TEXT_SET_TRANSLATION,
  DOM_POPUP_DETAIL,
  DOM_POPUP_OPEN_FLAGS_ARROW,
  DOM_POPUP_FLAGS_LISTING,
  DOM_POPUP_BY_TO_TRANSLATION,
} = DOM_ELEMENTS_FROM_POPUP;

const popup = () => {
  const resetFlagsListing = () => {
    const liItems = Array.from(DOM_POPUP_FLAGS_LISTING.querySelectorAll('li'));
    if (liItems.length > 0) {
      liItems.map(liItem => liItem.remove());
    }
  };

  const renderFlagsListing = () => {
    resetFlagsListing();

    for (let flag in flags) {
      const flagPreffix = flags[flag].preffix;
      const flagUrlFlagImage = flags[flag].image;
      const DOM_POPUP_FLAGS_LISTING_ITEM = createElement({ type: 'li' });

      DOM_POPUP_FLAGS_LISTING_ITEM.setAttribute('flag-preffix', flagPreffix);
      DOM_POPUP_FLAGS_LISTING_ITEM.innerHTML = `<img flag-preffix="${flagPreffix}" src="${chrome.extension.getURL(
        `images/flags/${flagUrlFlagImage}.png`
      )}" />`;

      chrome.storage.sync.get(['plugin_hl-t'], response => {
        const { preffixCountry } = response['plugin_hl-t'];

        if (flagPreffix === preffixCountry) {
          DOM_POPUP_FLAGS_LISTING_ITEM.classList.add('is-selected');
        }
      });

      DOM_POPUP_FLAGS_LISTING.appendChild(DOM_POPUP_FLAGS_LISTING_ITEM);
    }
  };

  const DOMPopupRender = () => {
    DOM_POPUP.appendChild(DOM_POPUP_TEXT_SET_TRANSLATION);
    DOM_POPUP.appendChild(DOM_POPUP_BY_TO_TRANSLATION);
    DOM_POPUP.appendChild(DOM_POPUP_DETAIL);

    DOM_POPUP_OPEN_FLAGS_ARROW.setAttribute(
      'src',
      chrome.extension.getURL(`images/chevron-down.svg`)
    );

    renderFlagsListing();
    DOM_POPUP.appendChild(DOM_POPUP_FLAGS_LISTING);
    document.body.appendChild(DOM_POPUP);
  };

  const renderToByTranslation = sourceLanguage => {
    chrome.storage.sync.get(['plugin_hl-t'], async response => {
      const { preffixCountry } = response['plugin_hl-t'];

      DOM_POPUP_BY_TO_TRANSLATION.innerHTML = `
        <p>
          By: <img src="${flagGetImageUrl(sourceLanguage)}" alt="" />
          To: <img src="${flagGetImageUrl(preffixCountry)}" alt="" />
        </p>
      `;

      DOM_POPUP_BY_TO_TRANSLATION.appendChild(DOM_POPUP_OPEN_FLAGS_ARROW);
    });
  };

  const removeEvents = () => {
    DOM_POPUP_OPEN_FLAGS_ARROW.removeEventListener('click', handleFlagsOpen);
    document.removeEventListener('click', handlePopupClose);
    document.removeEventListener('scroll', hide);
  };

  const hide = elementsToHide => {
    elementsToHide.map(element => element.classList.remove('is-active'));
    removeEvents();
  };

  const handleFlagsOpen = () => {
    DOM_POPUP_OPEN_FLAGS_ARROW.classList.toggle('is-active');
    DOM_POPUP_FLAGS_LISTING.classList.toggle('is-active');
  };

  const handlePopupClose = e => {
    e.stopPropagation();
    const elementTarget = e.target;

    if (
      isElementValid(elementTarget, [
        DOM_POPUP,
        DOM_POPUP_TEXT_SET_TRANSLATION,
        DOM_POPUP_DETAIL,
        DOM_POPUP_OPEN_FLAGS_ARROW,
        DOM_POPUP_FLAGS_LISTING,
        DOM_POPUP_BY_TO_TRANSLATION,
        ...Array.from(DOM_POPUP_FLAGS_LISTING.querySelectorAll('img')),
      ])
    ) {
      return;
    } else {
      hide([DOM_POPUP, DOM_POPUP_OPEN_FLAGS_ARROW, DOM_POPUP_FLAGS_LISTING]);
    }
  };

  document.addEventListener('scroll', e =>
    hide([DOM_POPUP, DOM_POPUP_OPEN_FLAGS_ARROW, DOM_POPUP_FLAGS_LISTING])
  );

  const handlePopupShowEvents = () => {
    DOM_POPUP_OPEN_FLAGS_ARROW.addEventListener('click', handleFlagsOpen);
    document.addEventListener('click', handlePopupClose);
  };

  const DOMPopupShow = translateData => {
    const { objectSelection, sourceLanguage, translatedText } = translateData;

    handlePopupShowEvents();
    renderToByTranslation(sourceLanguage);

    const DOM_POPUP_FLAGS_LISTING_IMAGES = Array.from(
      DOM_POPUP_FLAGS_LISTING.querySelectorAll('img')
    );

    const DOM_POPUP_FLAGS_LISTING_ITEMS = Array.from(
      DOM_POPUP_FLAGS_LISTING.querySelectorAll('li')
    );

    DOM_POPUP_FLAGS_LISTING_IMAGES.map(itemFlag => {
      itemFlag.addEventListener('click', async () => {
        const targetLanguage = itemFlag.getAttribute('flag-preffix');

        flagIsActive(DOM_POPUP_FLAGS_LISTING_ITEMS, targetLanguage);

        chrome.storage.sync.get(['plugin_hl-t'], response => {
          chrome.storage.sync.set({
            'plugin_hl-t': { ...response['plugin_hl-t'], preffixCountry: targetLanguage },
          });
        });

        const { translatedText } = await translate(targetLanguage)(
          DOM_POPUP_TEXT_SET_TRANSLATION.textContent
        );
        DOM_POPUP_TEXT_SET_TRANSLATION.innerHTML = translatedText;

        renderToByTranslation(sourceLanguage);
      });
    });

    const rangeT = objectSelection.getRangeAt(0);
    const rectT = rangeT.getBoundingClientRect();

    DOM_POPUP_TEXT_SET_TRANSLATION.innerHTML = translatedText;
    DOM_POPUP.classList.add('is-active');

    DOM_POPUP.style.top = `${rectT.y}px`;
    DOM_POPUP.style.left = `${rectT.x + rectT.width / 2 - DOM_POPUP.clientWidth / 2}px`;
  };

  return {
    DOMPopupRender,
    DOMPopupShow,
    DOMPopupDestroy: () => {},
  };
};

export default popup();
