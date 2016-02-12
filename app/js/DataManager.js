'use strict';

let _nodes = [];
let _edges = [];
let _options = {
  position: {
    top: 0,
    left: 0
  },
  zoom: 1
};

let _onUpdateCallbackHandler = () => '';

/**
 * @param {string} eventType
 * @param {string} target
 * @param {Object} data
 * @private
 */
function _dispatchUpdate(eventType, target, data) {
  _onUpdateCallbackHandler({
    event: eventType,
    target,
    change: data,
    data: {
      nodes: _nodes,
      edges: _edges,
      options: _options
    }
  });
}

/**
 * @param id
 * @private
 */
const _getEdge = (id) => _edges.filter(edge => edge.id === id)[0];

/**
 * @param id
 * @private
 */
const _getNode = (id) => _nodes.filter(node => node.id === id)[0];

/** ====================================================================================================================
 * @type {Object}
 ==================================================================================================================== */
const DataManager = {
  getOptions: () => _options,

  /**
   * @param options
   */
  setOptions: (options) => {
    _options = options;
    _dispatchUpdate('update', 'options', options);

    return DataManager;
  },

  /**
   * @returns {boolean}
   */
  isNodeSelected: () => !!_nodes.filter(n => n.isSelected).length,

  /**
   * @returns {boolean}
   */
  isEdgeSelected: () => !!_edges.filter(e => e.isSelected).length,

  /**
   *
   * @param id
   */
  selectEntity: (id) => {
    const entity = _getNode(id) || _getEdge(id);

    if (entity && !entity.isSelected) {
      DataManager.deselectAllEntities();
      entity.isSelected = true;
      _dispatchUpdate('update', entity.isNode ? 'node' : 'edge', entity);
    }

    return DataManager;
  },

  /**
   * @param forceRender
   */
  deselectAllEntities: (forceRender) => {
    _nodes.forEach(_node => {
      if (_node.isSelected) {
        _node.isSelected = false;
      }
    });

    _edges.forEach(_edge => {
      if (_edge.isSelected) {
        _edge.isSelected = false;
      }
    });

    if (forceRender) {
      _dispatchUpdate('update', 'nodes', {});
    }

    return DataManager;
  },

  /**
   * @param node
   * @returns {Object}
   */
  addNode: (node) => {
    _nodes.push(node);

    _dispatchUpdate('add', 'node', node);
    return DataManager;
  },

  /**
   * @param data
   */
  addData: (data) => {
    if (!data) {
      return DataManager;
    }

    _nodes = _nodes.concat(data.nodes) || _nodes;
    _edges = _edges.concat(data.edges) || _edges;

    _dispatchUpdate('add', 'nodes', data);
    return DataManager;
  },

  /**
   * @param node
   * @returns {Object}
   */
  updateNode: (node) => {
    _nodes = _nodes.map(_node => _node.id === node.id ? node : _node);

    _dispatchUpdate('update', 'node', node);
    return DataManager;
  },

  /**
   * @param node
   * @returns {Object}
   */
  deleteNode: (node) => {
    _nodes = _nodes.reduce((acc, n) => {
      if (node.id !== n.id) {
        acc.push(n);
      }

      return acc;
    }, []);

    _edges = _edges.reduce((acc, e) => {
      if (e.startNodeID !== node.id && e.endNodeID !== node.id) {
        acc.push(e);
      }

      return acc;
    }, []);

    _dispatchUpdate('delete', 'node', node);
    return DataManager;
  },

  /**
   * @param id
   * @returns {Object}
   */
  getNode: (id) => Object.assign({}, _getNode(id)),

  /**
   * @param edge
   * @returns {Object}
   */
  addEdge: (edge) => {
    _edges.push(edge);
    _dispatchUpdate('add', 'edge', edge);
    return DataManager;
  },

  /**
   * @param edge
   * @returns {Object}
   */
  updateEdge: (edge) => {
    _edges = _edges.map(_edge => _edge.id === edge.id ? edge : _edge);
    _dispatchUpdate('update', 'edge', edge);
    return DataManager;
  },

  /**
   * @param edge
   * @return {Object}
   */
  deleteEdge: (edge) => {
    _edges = _edges.reduce((acc, _edge) => {
      if (edge.id !== _edge.id) {
        acc.push(_edge);
      }

      return acc;
    }, []);

    _dispatchUpdate('delete', 'edge', edge);
    return DataManager;
  },

  /**
   * @param id
   * @returns {Array}
   */
  getEdge: (id) => Object.assign({}, _getEdge(id)),

  /**
   * @returns {Array}
   */
  getAllEdges: () => Array.from(_edges),

  /**
   * @param {function} fn
   */
  onChange: (fn) => _onUpdateCallbackHandler = fn
};

export default DataManager;
