import { vocabulary, operators } from '../../libs';

const { hasWord, find } = operators;

const popup = () => {
  const wrapper = document.createElement('DIV');
  const text = document.createElement('P');
  const arrowDown = document.createElement('SPAN');

  const wrapperControls = document.createElement('DIV');
  const buttonSave = document.createElement('button');
  const buttonListPage = document.createElement('button');
  const buttonDelete = document.createElement('button');

  const render = () => {
    wrapper.appendChild(text);
    wrapper.appendChild(wrapperControls);
    wrapper.appendChild(arrowDown);

    wrapperControls.appendChild(buttonListPage);

    wrapper.setAttribute('class', 'popup-hl');
    arrowDown.setAttribute('class', 'popup-hl__arrow-down');
    wrapperControls.setAttribute('class', 'popup-hl__controls');

    buttonSave.setAttribute('class', 'popup-hl__button popup-hl__button--save');
    buttonSave.innerHTML = `<img class="popup__button-image" src="${chrome.extension.getURL(
      'images/save-icon.svg'
    )}" alt="button save" />`;

    buttonListPage.setAttribute('class', 'popup-hl__button popup-hl__button--list-page');
    buttonListPage.innerHTML = `<img class="popup__button-image" src="${chrome.extension.getURL(
      'images/list.svg'
    )}" alt="button list" />`;

    buttonDelete.setAttribute('class', 'popup-hl__button popup-hl__button--list-delete');
    buttonDelete.innerHTML = `<img class="popup__button-image" src="${chrome.extension.getURL(
      'images/trash.svg'
    )}" alt="button delete" />`;

    document.body.appendChild(wrapper);
  };

  const close = () => {
    wrapper.classList.remove('is-active');
    text.innerHTML = '';
  };

  const closeWithMouseEvent = () => {
    document.addEventListener('click', e => {
      e.stopPropagation();
      const elementClicked = e.target;

      elementClicked !== wrapperControls &&
      elementClicked !== text &&
      elementClicked !== wrapper &&
      !elementClicked.classList.contains('popup__button-image')
        ? close()
        : null;
    });
    document.addEventListener('scroll', e => close());
  };

  const renderButton = async ({ selectedText, translatedText }) => {
    if (hasWord(find(await vocabulary.index(), selectedText))) {
      wrapperControls.appendChild(buttonDelete);
      buttonSave.remove();
    } else {
      wrapperControls.appendChild(buttonSave);
      buttonDelete.remove();
    }

    // buttonDelete.addEventListener('click', function () {
    //   store.remove(selectedText);
    //   this.remove();
    //   wrapperControls.appendChild(buttonSave);
    // });

    buttonSave.addEventListener('click', async function () {
      // store.add(selectedText, translatedText);
      await vocabulary.store([{ word: selectedText, translate: translatedText }]);
      this.remove();
      wrapperControls.appendChild(buttonDelete);
    });
  };

  const show = translateData => {
    const { objectSelection, translatedText } = translateData;

    renderButton(translateData);

    const rangeT = objectSelection.getRangeAt(0);
    const rectT = rangeT.getBoundingClientRect();

    text.innerHTML = translatedText;
    wrapper.classList.add('is-active');

    wrapper.style.top = `${rectT.y}px`;
    wrapper.style.left = `${rectT.x + rectT.width / 2 - wrapper.clientWidth / 2}px`;
  };

  return {
    buttons: {
      buttonSave,
      buttonListPage,
      buttonDelete,
    },
    render,
    show,
    closeWithMouseEvent,
    close,
  };
};

export default popup();
