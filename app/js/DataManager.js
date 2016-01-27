"use strict";

var _nodes = [];
var _edges = [];
var _onUpdateCallbackHandlers = [];

/**
 *
 * @param {string} eventType
 * @param {string} target
 * @param {Object} data
 * @private
 */
function _dispatchUpdate(eventType, target, data) {
  _onUpdateCallbackHandlers.forEach(function(callbackHandler) {
    callbackHandler({
      event: eventType,
      target: target,
      change: data,
      data: {
        nodes: _nodes,
        edges: _edges
      }
    });
  });
}

/**
 *
 * @type {Object}
 */
const DataManager = {
  /**
   *
   * @param node
   * @returns {Object}
   */
  addNode: function(node) {
    _nodes.push(node);

    _dispatchUpdate('add', 'node', node);
    return DataManager;
  },

  /**
   *
   * @param nodes
   * @returns {Object}
   */
  addNodes: function(nodes) {
    _nodes.concat(nodes);

    _dispatchUpdate('add', 'node', nodes);
    return DataManager;
  },

  /**
   *
   * @param node
   * @returns {Object}
   */
  updateNode: function(node) {
    //TODO implement
    //
    _dispatchUpdate('update', 'node', node);
    return DataManager;
  },

  /**
   *
   * @param node
   * @returns {Object}
   */
  deleteNode: function(node) {
    //TODO implement
    _dispatchUpdate('delete', 'node', node);
    return DataManager;
  },

  /**
   *
   * @param id
   * @returns {Object}
   */
  getNode: function(id) {
    return _nodes.filter(function(node) { return node.id === id })[0];
  },

  /**
   *
   * @returns {Array}
   */
  getAllNodes: function() {
    return _nodes;
  },

  /**
   *
   * @param nodes
   * @returns {Object}
   */
  deleteAllNodes: function(nodes) {
    _nodes = [];
    _dispatchUpdate('delete', 'node', nodes);
    return DataManager;
  },

  /**
   *
   * @param edge
   * @returns {Object}
   */
  addEdge: function(edge) {
    _edges.push(edge);
    _dispatchUpdate('add', 'edge', edge);
    return DataManager;
  },

  /**
   *
   * @param edges
   * @returns {Object}
   */
  addEdges: function(edges) {
    _edges.concat(edges);
    _dispatchUpdate('add', 'edge', edges);
    return DataManager;
  },

  /**
   *
   * @param edge
   * @returns {Object}
   */
  updateEdge: function(edge) {
    //TODO implement
    _dispatchUpdate('update', 'edge', edge);
    return DataManager;
  },

  /**
   *
   * @param edge
   * @returns {Object}
   */
  deleteEdge: function(edge) {
    //TODO implement
    _dispatchUpdate('delete', 'edge', edge);
    return DataManager;
  },

  /**
   *
   * @param id
   * @returns {T}
   */
  getEdge: function(id) {
    return _edges.filter(function(edge) { return edge.id === id; })[0];
  },

  /**
   *
   * @returns {Array}
   */
  getAllEdges: function() {
    return _edges;
  },

  /**
   *
   * @param edge
   * @returns {Object}
   */
  deleteAllEdges: function(edge) {
    _edges = [];
    _dispatchUpdate('delete', 'edge', edge);
    return DataManager;
  },

  /**
   *
   * @param {function} fn
   */
  onUpdate: function(fn) {
    _onUpdateCallbackHandlers.push(fn);
  }
};

export default DataManager;