'use strict';

import DataManager from '../DataManager';
import createId from '../utils/id.js';

class Edge {
  /**
   * @param {object} options
   * @param {number} options.startNodeID
   * @param {number} options.endNodeID
   * @param {array} options.middlePointOffset
   * @param {string} options.label
   * @constructor
   */
  constructor(options) {
    this.startNodeID = options.startNodeID;
    this.endNodeID = options.endNodeID;
    this.middlePointOffset = options.middlePointOffset || [0, 0];
    this.properties = [];
    this.label = options.label || 'undefined';
    this.id = createId();
    this.isSelected = false;
    this.isEdge = true;
  }

  static getEdgeMiddlePoint(edge) {
    const startNode = DataManager.getNode(edge.startNodeID);
    const endNode = DataManager.getNode(edge.endNodeID);

    return [
      (startNode.x + endNode.x) / 2,
      (startNode.y + endNode.y) / 2
    ];
  }
}

export default Edge;
