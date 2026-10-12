class ConfigResponse {
  constructor(externalNodes) {
    this.nodes = {};
    this.nodeLinks = [];
    this.alerts = [];
    this.errorHandler = new sn_mab_api.ErrorHandler();
    this.externalParentNodes = externalNodes;
    this.floorNodes = [];

    // Returning duplicate configuration constants to frontend
    var duplicateConfigMap = new sn_mab_api.DuplicateConfigMap();
    this.descendantsToReuse = duplicateConfigMap.descendantsToReuse || {};
    this.fieldsNotToDuplicate = duplicateConfigMap.fieldsNotToDuplicate || {};
    this.altNameFieldMap = duplicateConfigMap.altNameFieldMap || {};
    this.recordsNotToRename = duplicateConfigMap.recordsNotToRename || [];
    this.uiRuleActionExceptions = {};
    this.itemParameterExceptions = {};
  }

  addConfigNode(tableName, sysId, configNode) {
    if (!tableName || !sysId || !configNode) return;

    if (this.nodeExists(tableName, sysId, configNode))
      this.errorHandler.throwInternalError(
        'Configuration Node already exists in response: ' +
          tableName +
          ', id: ' +
          sysId
      );

    var tableEntries = this.nodes[tableName];
    if (!tableEntries) {
      tableEntries = {};
      this.nodes[tableName] = tableEntries;
    }

    tableEntries[sysId] = configNode;
  }

  nodeExists(tableName, sysId) {
    return this.nodes[tableName] && this.nodes[tableName][sysId] ? true : false;
  }

  preSerialize(copyMode) {
    delete this.externalParentNodes; // avoid serialization
    delete this.errorHandler;
    // Clean up copy only keys
    if (!copyMode) {
      delete this.descendantsToReuse;
      delete this.fieldsNotToDuplicate;
      delete this.altNameFieldMap;
      delete this.recordsNotToRename;
      delete this.uiRuleActionExceptions;
      delete this.itemParameterExceptions;
    }
  }

  existsInNodeList(tableName, sysId, nodeList) {
    if (!nodeList) return false;

    for (var i = 0; i < nodeList.length; i++) {
      var node = nodeList[i];
      if (sysId === node.sys_id && tableName === node.sys_class_name)
        return true;
    }

    return false;
  }

  getConfigNode(tableName, sysId) {
    return this.nodes[tableName] ? this.nodes[tableName][sysId] : undefined;
  }

  // If nodes is null, we will consider this ConfigResponse as empty.
  isEmpty() {
    return !this.nodes || this.nodes.length === 0;
  }

  validateNodeLinkParent(parentNodeTableName, parentNodeSysId) {
    if (!this.nodeExists(parentNodeTableName, parentNodeSysId)) {
      // parent node may be provided by the externalParentNodes data during a partial tree retrieval
      if (
        !this.existsInNodeList(
          parentNodeTableName,
          parentNodeSysId,
          this.externalParentNodes
        )
      ) {
        this.errorHandler.throwInternalError(
          'Trying to add node link to non existent node: ' +
            parentNodeTableName +
            ', id: ' +
            parentNodeSysId
        );
      }
    }
  }

  validateStandardNodeLink(
    parentNodeTableName,
    parentNodeSysId,
    childNodeTableName,
    childNodeSysId
  ) {
    this.validateNodeLinkParent(parentNodeTableName, parentNodeSysId);

    if (!this.nodeExists(childNodeTableName, childNodeSysId)) {
      this.errorHandler.throwInternalError(
        'Trying to add node link to non existent node: ' +
          childNodeTableName +
          ', id: ' +
          childNodeSysId
      );
    }

    if (
      this.nodeLinkExists(
        parentNodeTableName,
        parentNodeSysId,
        childNodeTableName,
        childNodeSysId
      )
    )
      return false;

    return true;
  }

  addAlert(alert) {
    this.alerts.push(alert);
  }

  validateAndAddNodeLink(
    parentNodeTableName,
    parentNodeSysId,
    childNodeTableName,
    childNodeSysId,
    isFloor
  ) {
    var validNodeLink = this.validateStandardNodeLink(
      parentNodeTableName,
      parentNodeSysId,
      childNodeTableName,
      childNodeSysId
    );
    if (validNodeLink)
      this.addNodeLink(
        parentNodeTableName,
        parentNodeSysId,
        childNodeTableName,
        childNodeSysId,
        isFloor
      );
  }

  addNodeLink(
    parentNodeTableName,
    parentNodeSysId,
    childNodeTableName,
    childNodeSysId,
    isFloor
  ) {
    if (isFloor === undefined) isFloor = false;

    this.nodeLinks.push({
      parentNode: {
        tableName: parentNodeTableName,
        sysId: parentNodeSysId,
      },
      childNode: {
        isFloor: isFloor,
        tableName: childNodeTableName,
        sysId: childNodeSysId,
      },
    });
  }

  addFloorNode(
    parentNodeTableName,
    parentNodeSysId,
    childNodeTableName,
    childNodeSysId
  ) {
    if (this.floorNodes.length > 0) {
      for (var i = 0; i < this.floorNodes.length; i++) {
        var currentNode = this.floorNodes[i];
        if (
          currentNode['parentNode']['tableName'] === parentNodeTableName &&
          currentNode['parentNode']['sysId'] === parentNodeSysId
        ) {
          currentNode['childNodes'].push({
            tableName: childNodeTableName,
            sysId: childNodeSysId,
          });
          return;
        }
      }
      this.floorNodes.push(
        this.createFloorNode(
          parentNodeTableName,
          parentNodeSysId,
          childNodeTableName,
          childNodeSysId
        )
      );
    } else {
      this.floorNodes.push(
        this.createFloorNode(
          parentNodeTableName,
          parentNodeSysId,
          childNodeTableName,
          childNodeSysId
        )
      );
    }
  }

  createFloorNode(
    parentNodeTableName,
    parentNodeSysId,
    childNodeTableName,
    childNodeSysId
  ) {
    return {
      parentNode: {
        tableName: parentNodeTableName,
        sysId: parentNodeSysId,
      },
      childNodes: [
        {
          tableName: childNodeTableName,
          sysId: childNodeSysId,
        },
      ],
    };
  }

  nodeLinkExists(
    parentNodeTableName,
    parentNodeSysId,
    childNodeTableName,
    childNodeSysId
  ) {
    var linkExists;
    this.nodeLinks.forEach(function (currLink) {
      if (linkExists) return;

      if (
        currLink.parentNode.tableName == parentNodeTableName &&
        currLink.parentNode.sysId == parentNodeSysId &&
        currLink.childNode.tableName == childNodeTableName &&
        currLink.childNode.sysId == childNodeSysId
      )
        linkExists = true;
    });
    return linkExists;
  }

  getAlert(tableName, sysId) {
    var alertExists;
    this.alerts.forEach(function (alert) {
      if (alertExists) return;

      if (alert.alertData.table == tableName && alert.alertData.sysId == sysId)
        alertExists = true;
    });
    return alertExists;
  }

  addUiRuleActionException(uiRuleActionTarget, uiRuleActionSysId) {
    this.uiRuleActionExceptions[uiRuleActionSysId] = uiRuleActionTarget;
  }

  addItemParameterException(itemParameterException, itemParameterSysId) {
    if (this.itemParameterExceptions[itemParameterSysId]) {
      var newFields = this.itemParameterExceptions[
        itemParameterSysId
      ].parent.fields.concat(itemParameterException.parent.fields);
      this.itemParameterExceptions[itemParameterSysId] = itemParameterException;
      this.itemParameterExceptions[itemParameterSysId].parent.fields =
        newFields;
    } else {
      this.itemParameterExceptions[itemParameterSysId] = itemParameterException;
    }
  }
}

module.exports = ConfigResponse;
