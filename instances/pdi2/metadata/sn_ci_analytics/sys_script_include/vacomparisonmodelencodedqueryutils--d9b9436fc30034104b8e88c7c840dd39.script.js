var VAComparisonModelEncodedQueryUtils = Class.create();
VAComparisonModelEncodedQueryUtils.prototype = {
    initialize: function() {
        this.nodeCounter = 0;
        this.currentNode = null;
        this.nodeStack = [];
        this.skeletonObject = {
            registers: [],
            graph: {},
            nodes: {},
            insertionCursor: {}
        };
    },
    PARSER_CONSTANTS: {
        symbols: ['/', '+', '>', '^', '\n'],
        orderOfWords: ['field', 'operator', 'conditionValue', 'comparisonType', 'children'],
        has_children: '=HAS_CHILDREN',
        children: 'children',
        field: 'field',
        comparison_type: 'comparisonType',
        signal: {
            'SIBLING_SEPERATOR': '+',
            'ELEMENT_SEPERATOR': '/',
            'STEP_INTO': '>',
            'STEP_OUT': '^',
            'EOS': '\n'
        },
        notations: ['NEW_QUERY', 'OR', 'AND', 'IN_WHICH', 'THAT_HAS']
    },
    _generateNodeID: function() {
        return 'NODE__' + (this.nodeCounter++);
    },
    _createNode: function(link) {
        var nodeId = this._generateNodeID();
        this.skeletonObject.registers.push({
            parent: link,
            node: nodeId
        });
        //create an array with order of words length elements
        //1. create it with one less element, fill with blank content
        //2. create the last element with an empty array (for children)

        //this.skeletonObject.nodes[nodeId] = Array(this.PARSER_CONSTANTS.orderOfWords.length - 1).fill(null);

        this.skeletonObject.nodes[nodeId] = [];
        for (var i = 0; i < this.PARSER_CONSTANTS.orderOfWords.length; i++) {
            i == this.PARSER_CONSTANTS.orderOfWords.length - 1 ? this.skeletonObject.nodes[nodeId].push([]) : this.skeletonObject.nodes[nodeId].push(null);

        }

        this.skeletonObject.graph[nodeId] = link;
        this.skeletonObject.insertionCursor[nodeId] = 0;
        this.nodeStack.push({
            parent: link,
            node: nodeId
        });
        return true;
    },
    _smartWordEvaluator: function(word, cursor) {
        word = decodeURIComponent(word);
        try {
            word = JSON.parse(word);
            if (cursor == this.PARSER_CONSTANTS.orderOfWords.indexOf(this.PARSER_CONSTANTS.comparison_type) && this.PARSER_CONSTANTS.notations.indexOf(word) == -1)
                return null;
            return typeof word == 'object' ? word : String(word);
        } catch (e) {
            if (cursor == this.PARSER_CONSTANTS.orderOfWords.indexOf(this.PARSER_CONSTANTS.comparison_type) && this.PARSER_CONSTANTS.notations.indexOf(word) == -1)
                return null;
            return typeof word == 'object' ? word : String(word);
        }

    },
    _registerToNode: function(nodeId, word) {
        if (this.skeletonObject.insertionCursor[nodeId] == (this.PARSER_CONSTANTS.orderOfWords.length)) return;
        var cursor = this.skeletonObject.insertionCursor[nodeId]++;
        this.skeletonObject.nodes[nodeId][cursor] = this._smartWordEvaluator(word, cursor);
    },
    _getCurrentNodeId: function(sendParentIdInstead) {
        if (this.nodeStack.length == 0) return null;
        return sendParentIdInstead ? this.nodeStack[this.nodeStack.length - 1].parent : this.nodeStack[this.nodeStack.length - 1].node;
    },
    _convertObjectToArray: function(object) {
        var responseArray = [];
        for (var key in object) {
            responseArray.push(object[key]);
        }
        return responseArray;
    },
    _cleanResponse: function(index, object) {
        if (index == object.length) {
            return object;
        }
        if (typeof(object[index].children) == 'object' && object[index].children != null) {
            object[index].children = this._convertObjectToArray(object[index].children);
            this._cleanResponse(0, object[index].children);
        }
        return this._cleanResponse(++index, object);
    },
    convertToVAComparisonModel: function() {
        var response = {},
            _self = this;
        _self.skeletonObject.registers.map(function(node, nodeIndex) {
            var _node = node.node,
                _parentNode = node.parent,
                _thisNodeStruct = {},
                val;
            _self.PARSER_CONSTANTS.orderOfWords.forEach(function(field, fieldIndex) {
                val = _self.skeletonObject.nodes[_node][fieldIndex] == undefined ? null : _self.skeletonObject.nodes[_node][fieldIndex];
                if (field == _self.PARSER_CONSTANTS.children && val == _self.PARSER_CONSTANTS.has_children) {
                    _thisNodeStruct[field] = {};
                } else if (field == _self.PARSER_CONSTANTS.field) {
                    _thisNodeStruct[field] = val;
                } else {
                    _thisNodeStruct[field] = val;
                }
            });

            if (_parentNode) { //to support nth level cascading
                var nodeTrackerPath = [_parentNode],
                    nodeTracker = 1,
                    cloneResponse = {};
                while (!response[_parentNode]) {
                    _parentNode = _self.skeletonObject.graph[_parentNode];
                    nodeTrackerPath.unshift(_parentNode);
                }
                cloneResponse = response[nodeTrackerPath[0]];
                while (nodeTracker < nodeTrackerPath.length) {
                    cloneResponse = cloneResponse.children[nodeTrackerPath[nodeTracker]];
                    nodeTracker++;
                }
                cloneResponse.children[_node] = _thisNodeStruct;
            } else {
                response[_node] = _thisNodeStruct;
            }

        });
        return this._cleanResponse(0, this._convertObjectToArray(JSON.parse(JSON.stringify(response))));
    },
    _encodeWord: function(word) {
        if (typeof word == 'string') return encodeURIComponent(word);
        return encodeURIComponent(JSON.stringify(word));
    },
    _encodeJSON: function(jsonQuery, startIndex, encodedString) {
        if (jsonQuery.length == startIndex) {
            return encodedString;
        }
        if (startIndex > 0) encodedString += this.PARSER_CONSTANTS.signal.SIBLING_SEPERATOR;
        var fieldValues = [];
        var _self = this;
        this.PARSER_CONSTANTS.orderOfWords.forEach(function(field, index) {
            if (field != _self.PARSER_CONSTANTS.children) {
                fieldValues.push(_self._encodeWord(jsonQuery[startIndex][field]));
            }
        });
        encodedString += fieldValues.join(this.PARSER_CONSTANTS.signal.ELEMENT_SEPERATOR);
        if (jsonQuery[startIndex].children && Array.isArray(jsonQuery[startIndex].children)) {
            var _children = this._encodeJSON(jsonQuery[startIndex].children, 0, '');
            if (_children)
                encodedString = encodedString +
                this.PARSER_CONSTANTS.signal.STEP_INTO +
                _children +
                this.PARSER_CONSTANTS.signal.STEP_OUT;
        }
        return this._encodeJSON(jsonQuery, ++startIndex, encodedString);
    },


    /**
     * Converts VA Comparison Model to VA Encoded String
     * @param {*} jsonQuery 
     * @returns String
     */

    //Currently used via client_script_include
    encodeVAURIQuery: function(jsonQuery) {
        if (!jsonQuery || typeof jsonQuery != 'object') return null;
        if (jsonQuery.length == 0) return null;
        return this._encodeJSON(jsonQuery, 0, '');
    },



    /**
     * Converts VA Encoded String to VA Comparison JSON Model
     * @param {String} encodedString 
     * @param {Boolean} exposeSkeleton 
     * @returns Object
     */
    decodeVAURIQuery: function(encodedString, exposeSkeleton) {
        if (!encodedString) return [];
        var word = '',
            parentNodeId = null;
        this._createNode(null);
        encodedString += this.PARSER_CONSTANTS.signal.EOS;
        for (var i = 0; i < encodedString.length; i++) {
            var ch = encodedString[i];
            if (this.PARSER_CONSTANTS.symbols.indexOf(ch) != -1) {
                this._registerToNode(this._getCurrentNodeId(), word);
                switch (ch) { // special operations for other markers
                    case this.PARSER_CONSTANTS.signal.STEP_INTO:
                        parentNodeId = this._getCurrentNodeId();
                        this._createNode(this._getCurrentNodeId());
                        this._registerToNode(parentNodeId, this.PARSER_CONSTANTS.has_children);
                        break;

                    case this.PARSER_CONSTANTS.signal.STEP_OUT:
                        this.nodeStack.pop();
                        break;

                    case this.PARSER_CONSTANTS.signal.SIBLING_SEPERATOR:
                        parentNodeId = this._getCurrentNodeId(true);
                        this.nodeStack.pop();
                        this._createNode(parentNodeId);
                        break;
                    default:
                        null;
                }
                word = '';
            } else
                word += ch;
        }
        var api = {
            'va_comparison_model': this.convertToVAComparisonModel()
        };
        if (exposeSkeleton) api['skeleton'] = this.skeletonObject;
        return api;
    },
    type: 'VAComparisonModelEncodedQueryUtils'
};
