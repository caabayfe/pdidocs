class ConfigSortingService {
  constructor() {
    this.validationHandler = new sn_mab_api.ValidationHandler();
    this.errorHandler = new sn_mab_api.ErrorHandler();
  }

  sortNodes(inputData) {
    var sortedNodes = [];
    var nodesMap = this.parseNodes(inputData);
    this.connectNodes(nodesMap);

    var foundGraph;
    //Try to extract all the different graphs from our nodes one at a time
    do {
      foundGraph = false;
      var extractedGraph = this.extractGraph(nodesMap);
      if (extractedGraph && Object.keys(extractedGraph).length) {
        foundGraph = true;
        sortedNodes = this.concatArray(
          sortedNodes,
          this.sortGraphTopographicalOrder(extractedGraph)
        );
      }
    } while (foundGraph);

    //Sanity check, we should have cleared out all our nodes or found a cycle and thrown an error
    if (Object.keys(nodesMap).length)
      this.errorHandler.throwInternalError(
        'Error - Remaining nodes after sorting'
      );

    //cleanup
    sortedNodes.forEach(function (currNode) {
      delete currNode.children;
      delete currNode.parents;
      delete currNode.tempMarked;
      delete currNode.marked;
    });

    return sortedNodes;
  }

  parseNodes(inputData) {
    var outputNodesMap = {};

    if (!inputData || !Object.keys(inputData).length) return outputNodesMap;

    //Flatten structure and create a map of sysId to nodes
    for (var currTableName in inputData) {
      for (var currSysId in inputData[currTableName]) {
        var outputNode = {
          tableName: currTableName,
          sysId: currSysId,
          fields: inputData[currTableName][currSysId],
          children: [],
          parents: [],
        };
        outputNodesMap[currSysId] = outputNode;
      }
    }

    return outputNodesMap;
  }

  connectNodes(nodes) {
    //Connect all nodes just by comparing sysIds, sysIds should be unique across all tables/rows
    for (var currNodeSysId in nodes) {
      var currNode = nodes[currNodeSysId];
      //loop through all nodes fields for any value which can represent a sysId
      for (var currFieldName in currNode.fields) {
        var possibleSysId = currNode.fields[currFieldName];
        //Does our curr field contain something like a sysId and does this sysId exist in our nodes?
        if (
          !this.validationHandler.isGeneratedOrNormalSysId(possibleSysId) ||
          !nodes[possibleSysId]
        )
          continue;

        // if update node contains its sys_id dont connect as child or parent
        if (currNodeSysId === possibleSysId) continue;

        currNode.children.push(possibleSysId);
        nodes[possibleSysId].parents.push(currNodeSysId);
      }
    }
  }

  extractGraph(nodesMap) {
    var nodesMapKeys = Object.keys(nodesMap);
    //Anything left to extract?
    if (!nodesMapKeys.length) return null;

    //If so grab the first one and follow it to extract out the graph connected to it
    var extractedGraphNodes = {};
    this.extractGraphNodes(nodesMapKeys[0], nodesMap, extractedGraphNodes);
    return extractedGraphNodes;
  }

  extractGraphNodes(currNodeSysId, allNodes, graphNodes) {
    //Does currNode exist?
    if (!allNodes[currNodeSysId]) return;

    //Add ourselves to the output and delete from original node list
    var currNode = allNodes[currNodeSysId];
    graphNodes[currNodeSysId] = currNode;
    delete allNodes[currNodeSysId];

    //Process children and parent nodes
    currNode.children.forEach(function (currChildSysId) {
      this.extractGraphNodes(currChildSysId, allNodes, graphNodes);
    }, this);
    currNode.parents.forEach(function (currParentSysId) {
      this.extractGraphNodes(currParentSysId, allNodes, graphNodes);
    }, this);
  }

  //Topographical sort algorithm based on depth first search
  sortGraphTopographicalOrder(graphNodes) {
    var sortedNodes = [];
    var foundUnMarkedNode;
    do {
      foundUnMarkedNode = false;
      for (var currNodeSysId in graphNodes) {
        if (graphNodes[currNodeSysId].marked) continue;

        foundUnMarkedNode = true;
        this.visitNode(graphNodes[currNodeSysId], graphNodes, sortedNodes);
      }
    } while (foundUnMarkedNode);

    return sortedNodes;
  }

  visitNode(node, graphNodes, sortedNodes) {
    if (!node || node.marked) return;

    if (node.tempMarked)
      this.errorHandler.throwBadRequestError(
        'Error - Cycle found in nodes, cannot sort'
      );

    node.tempMarked = true;

    node.children.forEach(function (currChildSysId) {
      this.visitNode(graphNodes[currChildSysId], graphNodes, sortedNodes);
    }, this);

    node.tempMarked = false;
    node.marked = true;

    sortedNodes.push(node);
  }

  concatArray(first, second) {
    var outputArray = [];
    if (first) outputArray = first;

    if (second)
      second.forEach(function (currValue) {
        outputArray.push(currValue);
      });

    return outputArray;
  }
}

module.exports = ConfigSortingService;
