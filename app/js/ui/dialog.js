'use strict';

import CONST from '../enums/CONST';
import createDomElementInContainer from '../utils/dom';

import SaveManager from '../SaveManager';
import DataManager from '../DataManager';

/**
 * @type {string} The Id of the selected save entry
 */
let _selectedSaveId;

/**
 * @param {string} id
 * @private
 */
const _selectSave = (id) => {
  _selectedSaveId = id;
  Dialog.render();
};

const _createNewSave = () => {
  const dataToSave = {
    data: {
      nodes: DataManager.getAllNodes(),
      edges: DataManager.getAllEdges()
    }
  };

  const name = document.querySelector('.new-save-name-input').value;
  SaveManager.save(dataToSave, name);
};

/**
 * @param saves
 * @private
 */
const _getHTML = (saves) => `
     <div class="dialog">
        <div class="header">Saved graphs</div>
        <div class="sub-header">
          <span>Save graph as:</span>
          <input type="text" maxlength="20" placeholder="Name of the save you wanna save." class="new-save-name-input" />
          <button class="save-btn">Save</button>
        </div>
        <div class="body">
          <ul class="saves-list">${_getSavesHTML(saves)}</ul>
        </div>
        <div class="footer">
          <button class="new-save-btn left">New Save</button>
          <button class="delete-btn" style="${!_selectedSaveId && 'display: none;'}">Delete Save</button>
          <button class="load-btn" style="${!_selectedSaveId && 'display: none;'}">Load Save</button>
          <button class="close-dialog-btn">Close</button>
        </div>
      </div>`;

/**
 * @param saves
 * @returns {string}
 * @private
 */
const _getSavesHTML = (saves) => {
  let html = ``;

  saves.forEach(save => {
    html += `
    <li class="save-entry ${_selectedSaveId === save.id && 'selected'}" title="${save.data.nodes.length} nodes, ${save.data.edges.length} edges" id="${save.id}">
      <div class="icon">&#128196;</div>
      <div class="name">${save.name}
        <small>${save.date}</small>
      </div>
    </li>`;
  });

  return html;
};

/**
 * @private
 */
const _setupDialog = () => {
  if (_setupDialog.isDone) {
    return;
  }

  Dialog.dialogLayer = createDomElementInContainer(`#${CONST.EDITOR_ID}`,
    'div',
    'overlay-dialog',
    'overlay-dialog'
  );

  SaveManager.onChange(data => {
    Dialog.render(data);
  });

  d3.select('body').on('keydown', () => {
    const enterKey = 13;
    const esc = 27;
    const focusedElement = document.activeElement;

    if (d3.event.keyCode === enterKey && focusedElement && focusedElement.classList.contains('new-save-name-input')) {
      _createNewSave();
      d3.event.preventDefault();
      d3.event.stopPropagation();
    }

    if (d3.event.keyCode === esc) {
      Dialog.close();
      d3.event.preventDefault();
      d3.event.stopPropagation();
    }
  });

  Dialog.dialogLayer.addEventListener('click', (e) => {
    const target = e.target;
    const className = target.classList[0];

    switch (className) {
      case 'close-dialog-btn':
        Dialog.close();
        break;
      case 'new-save-btn':
        Dialog.open(true);
        break;
      case 'save-btn':
        _createNewSave();
        break;
      case 'load-btn':
        SaveManager.load(_selectedSaveId);
        break;
      case 'delete-btn':
        SaveManager.delete(_selectedSaveId);
        break;
      case 'save-entry':
        _selectSave(target.id);
        break;
      default:
        break;
    }
  });

  _setupDialog.isDone = true;
};

/**
 * @type {{render: Function, open: Function, close: Function}}
 */
const Dialog = {

  render: () => {
    const saves = SaveManager.getSaves();
    Dialog.dialogLayer.innerHTML = _getHTML(saves);
  },

  /**
   * @param {boolean} forSave is the open for save or load action
   */
  open: (forSave) => {
    _setupDialog();

    // reset the selected
    _selectedSaveId = null;

    Dialog.render();

    // hide header for just loading
    document.querySelector('.dialog .sub-header').style.display = forSave ? 'flex' : 'none';
    document.querySelector('.dialog .sub-header .new-save-name-input').focus();

    // set opened class later on so there will be open-transition
    setTimeout(() => {
      Dialog.dialogLayer.classList.add('opened');
    }, 0);
  },

  /**
   *
   */
  close: () => {
    _setupDialog();
    Dialog.dialogLayer.classList.remove('opened');
  }
};


export default Dialog;
