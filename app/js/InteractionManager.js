'use strict';

import d3 from 'd3';

import CONST from './enums/CONST';
import ACTION from './enums/ACTION';

import Node from './do/Node';
import Edge from './do/Edge';

import ContextMenu from './ContextMenu';
import PropertiesManager from './PropertiesManager';
import DataManager from './DataManager';
import RenderManager from './RenderManager';

/**
 *
 * @param node
 * @private
 */
function _getTarget(node) {
  const type = node.nodeName;
  let target = {};

  if (type === 'circle') {
    target = DataManager.getNode(node.parentNode.id);
  }

  if (type === 'text') {
    target = DataManager.getEdge(node.parentNode.id);
  }

  if (node.id === CONST.SVGROOT_ID) {
    target = node;
  }

  return target;
}

// TODO: node and edge drag can be the same?!
const _nodeDragBehavior = d3.behavior.drag()
  .origin(node => node)
  .on('dragstart', node => {
    d3.event.sourceEvent.stopPropagation();
    d3.select(`#${node.id}`).classed('dragging', true);
  })
  .on('drag', node => {
    node.x = d3.event.x;
    node.y = d3.event.y;
    DataManager.updateNode(node);
  })
  .on('dragend', node => {
    d3.select(`#${node.id}`).classed('dragging', false);
  });

const _edgeDragBehavior = d3.behavior.drag()
  .origin(edge => edge)
  .on('dragstart', edge => {
    d3.event.sourceEvent.stopPropagation();
    d3.select(`#${edge.id}`).select('text').classed('dragging', true);
  })
  .on('drag', edge => {
    edge.middlePointOffset = [
      edge.middlePoint[0] - d3.event.sourceEvent.x,
      edge.middlePoint[1] - d3.event.sourceEvent.y
    ];
    DataManager.updateEdge(edge);
  })
  .on('dragend', edge => {
    d3.select(`#${edge.id}`).select('text').classed('dragging', false);
  });

const _updatePosition = (direction) => {
  const allNodes = DataManager.getAllNodes();

  let movedNodes = allNodes.map(node => {
    node.x += direction[0];
    node.y += direction[1];
    return node;
  });

  DataManager.setAllNodes(movedNodes);
};

const _zoomAndDragBehaviour = d3.behavior.zoom()
  .on('zoom', () => {
    const direction = d3.event.sourceEvent;
    if (direction) {
      _updatePosition([direction.movementX, direction.movementY]);
    }
  });


/**
 *
 * @param {object} d3Element
 * @param {Element} rootDivElement
 * @constructor
 */
const IM = {
  /**
   * @param d3Element
   * @param rootDivElement
   * @returns {*}
   */
  init: (d3Element, rootDivElement) => {
    if (d3Element === undefined) {
      throw new Error('The EventManager needs a "container" to attach and listen for events.');
    }

    IM._container = d3Element;

    // user keyboard handling
    d3.select('body').on('keydown', IM.keydownHandler);

    IM._container.call(_zoomAndDragBehaviour);
    IM._container.on('click', IM.svgClickHandler);
    IM._container.on('contextmenu', IM.contextClickHandler);

    // initialize the context menu
    ContextMenu.init(`#${rootDivElement.id}`);

    PropertiesManager.onClose((entityToSave) => {
      if (!entityToSave) {
        return;
      }

      entityToSave.isNode ? DataManager.updateNode(entityToSave) : DataManager.updateEdge(entityToSave);
    });

    ContextMenu.onAction((action) => {
      switch (action.type) {
        case ACTION.CREATE_NODE:
          const node = new Node({
            x: action.position.x,
            y: action.position.y
          });

          DataManager.addNode(node);
          break;
        case ACTION.DELETE_NODE:
          DataManager.deleteNode(action.target);
          break;
        case ACTION.EDIT:
          PropertiesManager.open([action.position.x, action.position.y], action.target);
          break;
        case ACTION.CREATE_EDGE:
          IM.createEdgeMouseMove.startNode = action.target;
          IM.createEdgeMouseDown.startNode = action.target;

          RenderManager.prepareForRenderLine({ source: action.target });

          IM._container.on('mousemove', IM.createEdgeMouseMove);
          IM._container.on('mouseup', IM.createEdgeMouseDown);
          break;
        case ACTION.DELETE_EDGE:
          DataManager.deleteEdge(action.target);
          break;
        default:
          console.log('Unhandeled context menu action', action);
      }
    });

    return IM;
  },

  /**
   * @param entity
   */
  bindEvents: (entity) => {
    // need to wait for the entity to enter the dom
    window.setTimeout(() => {
      const selection = entity.isNode ? d3.select(`#${entity.id}`) : d3.select(`#${entity.id}`).select('text');

      selection
        .on('dblclick', _entity => {
          PropertiesManager.open([d3.event.x, d3.event.y], _entity);
          d3.event.preventDefault();
        })
        .on('mousedown', _entity => {
          DataManager.selectEntity(_entity.id);
          d3.event.preventDefault();
        })
        .call(entity.isNode ? _nodeDragBehavior : _edgeDragBehavior);
    }, 0);
  },

  /**
   *
   */
  svgClickHandler: () => {
    // blur the focus
    document.activeElement.blur();

    // close the context menu
    ContextMenu.close();
    PropertiesManager.close();

    const isEdgeText = d3.event.target.classList.contains('path-text');
    const isNode = d3.event.target.nodeName === 'circle';

    // click on the root svg element
    if (!isEdgeText && !isNode && DataManager.isEntitySelected()) {
      DataManager.deselectAllEntities(true);
    }

    d3.event.preventDefault();
  },

  /**
   *
   */
  contextClickHandler: () => {
    ContextMenu.open([d3.event.x, d3.event.y], _getTarget(d3.event.target));
    d3.event.preventDefault();
  },

  keydownHandler: () => {
    const focusedElement = document.activeElement;
    const focusedElementType = focusedElement.nodeName; // upppercase

    const backKey = 8;
    const escKey = 27;
    const delKey = 46;
    const spaceKey = 32;
    const enterKey = 13;

    const infoKey = 192; // '`' button

    const leftKey = 37;
    const topKey = 38;
    const rightKey = 39;
    const bottomKey = 40;

    const keyMoveStep = 10;

    switch (d3.event.keyCode) {
      case backKey:
        if (focusedElementType !== 'INPUT') {
          // prevent returning - history back, when the back button is pressed
          d3.event.preventDefault();
        }
        break;
      case infoKey:
        // toggle the info panel `
        focusedElement.classList.contains(CONST.INFO_ID) ? focusedElement.blur() : document.querySelector(`#${CONST.INFO_ID}`).focus();
        break;
      case delKey:
        // const selectedNode = DataManager.getSelectedNode();
        break;
      case escKey:
        DataManager.deselectAllEntities(true);
        PropertiesManager.close();
        break;
      case enterKey: {
        const selectedEntity = DataManager.getSelectedEntity();

        /**
         * @param entity
         */
        const fnSelectAndOpen = (entity) => {
          DataManager.selectEntity(entity.id);

          if (entity.isNode) {
            PropertiesManager.open([entity.x, entity.y], entity);
          }

          if (entity.isEdge) {
            PropertiesManager.open(entity.middlePointWithOffset, entity);
          }
        };

        if (selectedEntity) {
          fnSelectAndOpen(selectedEntity);
        }

        if (focusedElement.classList.contains('path-text')) {
          const edgeElement = focusedElement.parentElement;
          fnSelectAndOpen(DataManager.getEdge(edgeElement.id));
        }

        if (focusedElement.classList.contains('node')) {
          fnSelectAndOpen(DataManager.getNode(focusedElement.id));
        }

        break;
      }
      case spaceKey:
        if (focusedElement.classList.contains('path-text')) {
          const edgeElement = focusedElement.parentElement;
          DataManager.selectEntity(edgeElement.id);
        }

        if (focusedElement.classList.contains('node')) {
          DataManager.selectEntity(focusedElement.id);
        }
        break;
      case leftKey:
        if (['INPUT', 'SELECT'].indexOf(focusedElementType) === -1) {
          _updatePosition([-keyMoveStep, 0]);
          d3.event.preventDefault();
        }
        break;
      case topKey:
        if (['INPUT', 'SELECT'].indexOf(focusedElementType) === -1) {
          _updatePosition([0, -keyMoveStep]);
          d3.event.preventDefault();
        }
        break;
      case rightKey:
        if (['INPUT', 'SELECT'].indexOf(focusedElementType) === -1) {
          _updatePosition([keyMoveStep, 0]);
          d3.event.preventDefault();
        }
        break;
      case bottomKey:
        if (['INPUT', 'SELECT'].indexOf(focusedElementType) === -1) {
          _updatePosition([0, keyMoveStep]);
          d3.event.preventDefault();
        }
        break;
      default:
        break;
    }
  },

  /**
   *
   */
  createEdgeMouseMove: () => {
    const startNode = IM.createEdgeMouseMove.startNode;

    RenderManager.renderLine({
      source: startNode,
      end: [d3.event.x, d3.event.y]
    });
  },

  /**
   *
   */
  createEdgeMouseDown: () => {
    const endNode = _getTarget(d3.event.target);
    const startNode = IM.createEdgeMouseMove.startNode;

    RenderManager.removeTempLine();

    if (endNode.isNode) {
      const newEdge = new Edge({
        endNodeId: endNode.id,
        startNodeId: startNode.id
      });

      DataManager.addEdge(newEdge);
    }

    IM._container.on('mousemove', null);
    IM._container.on('mouseup', null);
    d3.event.preventDefault();
  }
};

export default IM;
