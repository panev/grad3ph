'use strict';

import createDomElementInContainer from '../utils/dom';
import DataManager from '../DataManager';
import HistoryManager from '../HistoryManager';
import SaveManager from '../SaveManager';
import NotificationManager from '../NotificationManager';
import PROPERTY_TYPES from '../enums/PROPERTY_TYPES';

import Dialog from './dialog';

const TextTypes = [PROPERTY_TYPES.STRING, PROPERTY_TYPES.URL, PROPERTY_TYPES.EMAIL, PROPERTY_TYPES.PASSWORD];

export default (parentElement) => {
  const $menu = createDomElementInContainer(`#${parentElement.id}`, 'div', 'menu-overlay', 'menu-overlay');

  const html = `
    <menu class="top-menu" id="top-menu">
      <span class="toggle-button">&#9776;</span>
      <section class="drop-down-menu">
        <ul>
          <li class="menu-save-btn">&#128190; Save <small>(ctrl+s)</small></li>
          <li class="menu-load-btn">&#128194; Load <small>(ctrl+l)</small></li>
          <li class="menu-undo-btn">&#8617; Undo <small>(ctrl+z)</small></li>
          <li class="menu-redo-btn">&#8618; Redo <small>(ctrl+y)</small></li>
          <li class="menu-delete-all-btn">&#10005; Delete all</li>
        </ul>
      </section>
      <span class="graphql-schema">&#2947</span>
    </menu>`;

  $menu.innerHTML = html;

  d3.select('body').on('keydown.menu', () => {
    const l = 76;
    const s = 83;
    const y = 89;
    const z = 90;

    if (d3.event.ctrlKey || d3.event.metaKey) {
      switch (d3.event.keyCode) {
        case s:
          // open for save - true
          Dialog.open(true);
          d3.event.preventDefault();
          break;
        case l:
          // open for save - false
          Dialog.open(false);
          d3.event.preventDefault();
          break;
        case z:
          HistoryManager.undo();
          d3.event.preventDefault();
          break;
        case y:
          HistoryManager.redo();
          d3.event.preventDefault();
          break;
        default:
          break;
      }
    }
  });

  document.querySelector('.graphql-schema').addEventListener('click', () => {
    const nodes = DataManager.getAllNodes();
    const edges = DataManager.getAllEdges();

    const customTypes = `
# Date scalar description
scalar Date

# Email scalar description
scalar Email

# Url scalar description
scalar Url

# Password scalar description
scalar Password

input GeoPointInput {
  lat: Float!
  lng: Float!
}

# GeoPoint description
type GeoPoint {
  lat: Float!
  lng: Float!
}

interface Node {
  id: ID!
}

interface Edge {
  id: ID!
  node: Node
}

interface Connection {
  nodes: [Node]
  edges: [Edge]
  pageInfo: PageInfo
  totalCount: Int!
}

# page info object - an object to hold the paging and cursors information. github like
type PageInfo {
  endCursor: String
  hasNextPage: String
  hasPreviousPage: String
  startCursor: String
}
`;

    String.prototype.toCamelCase = function () {
      return this.replace(/\b(\w+)/g, function (m,p) { return p[0].toUpperCase() + p.substr(1).toLowerCase(); });
    };

    /**
     * @param {object} p
     * @returns {string}
     * @private
     */
    const _getPropertySpec = (p) => {
      const suffix = TextTypes.indexOf(p.type) !== -1 ? ' length' : '';
      let propertyDescription = `#${p.type}`;

      if (p.defaultValue) {
        propertyDescription += `; default: ${p.defaultValue}`;
      }

      if (p.limitMin) {
        propertyDescription += `; min${suffix}: ${p.limitMin}`;
      }

      if (p.limitMax) {
        propertyDescription += `; max${suffix}: ${p.limitMax}`;
      }

      const propertySpec = `
  ${propertyDescription}
  ${p.key}: ${p.type}${p.isRequired ? '!' : ''}
`;

      return propertySpec;
    };

    /**
     *
     * @param {object} n
     * @returns {string}
     * @private
     */
    const _getNodeSpec = (n) => {
      const description = ``;
      const properties = n.properties.map(_getPropertySpec).join('');

      const nodeSpec = `
${description}
type ${n.label.toCamelCase()} implements Node {
  ${properties}
}`;
      return nodeSpec;
    };



    const nodeTypes = nodes.map(_getNodeSpec).join('\n');

    const schema = `
${customTypes}
${nodeTypes}
`;

    console.log(schema);
  });

  // close the menu
  document.querySelector('.menu-overlay').addEventListener('click', () => {
    document.querySelector('.menu-overlay').classList.remove('opened');
  });

  // open/close the menu
  document.querySelector('.toggle-button').addEventListener('click', (e) => {
    document.querySelector('.menu-overlay').classList.toggle('opened');
    e.stopPropagation();
    e.preventDefault();
  });

  document.querySelector('.menu-save-btn').addEventListener('click', () => {
    Dialog.open(true);
  });

  document.querySelector('.menu-load-btn').addEventListener('click', () => {
    Dialog.open(false);
  });

  document.querySelector('.menu-undo-btn').addEventListener('click', () => {
    HistoryManager.undo();
    e.preventDefault();
  });

  document.querySelector('.menu-redo-btn').addEventListener('click', () => {
    HistoryManager.redo();
    e.preventDefault();
  });

  document.querySelector('.menu-delete-all-btn').addEventListener('click', () => {
    if (window.confirm('Are you sure you want to delete all nodes and edges?')) {
      DataManager.clear();
      NotificationManager.error('All nodes and edges have been deleted. (Hint: Ctrl+Z to undo)');
    }
  });
};
