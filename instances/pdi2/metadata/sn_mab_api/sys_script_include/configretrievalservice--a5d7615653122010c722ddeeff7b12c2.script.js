class ConfigRetrievalService {
  constructor(copyMode) {
    this.configKeyFactory = new sn_mab_api.ConfigKeyFactory();
    this.daoCache = new sn_mab_api.MobileDAOCache();
    this.configKeyStackCreator = new sn_mab_api.ConfigKeyStackCreator();
    this.configResponse = new sn_mab_api.ConfigResponse();
    this.validationHandler = new sn_mab_api.ValidationHandler();
    this.errorHandler = new sn_mab_api.ErrorHandler();
    this.alertHandler = new sn_mab_api.AlertHandler();
    this.configKeyStack = [];
    this.configTypeMap = new sn_mab_api.A_ConfigTypeMap();
    this.typeMap = this.configTypeMap.typeMap;
    this.hideFromContentTreeNodes = this.configTypeMap.hideFromContentTreeNodes;
    // Duplicate options
    this.copyMode = copyMode;
    this.initialCopyNode = null;
    this.duplicateParent = false;
    this.duplicateConfigMap = new sn_mab_api.DuplicateConfigMap();
    this.descendantsToReuse = this.duplicateConfigMap.descendantsToReuse;
    // Used to keep track of mobile ui rules with a parent table !== sys_sg_view_config
    this.nonCardUiRulesToDuplicate = [];
    // Because the target field on ui rule actions associated to them behave uniquely
    this.nonCardUiRuleActions = [];
    this.uiRuleActionTargets = {};
    // Parameterized condition builders also similarly rely on the name of a record instead of the sysId
    this.parameterizedConditionBuilders =
      this.duplicateConfigMap.parameterizedConditionBuilders;
    this.parameterizedConditions = {};
    this.itemParameters = [];
    this.recordCache = {};
  }

  retrieveConfig(tableName, sysId, externalNodes, parentNode) {
    if (this.copyMode) {
      this.initialCopyNode = {
        tableName: tableName,
        sysId: sysId,
      };

      if (parentNode) {
        this.duplicateParent = true;
      }

      return this.retrieveCopyConfig(tableName, sysId, parentNode);
    } else {
      return this.retrieveStandardConfig(tableName, sysId, externalNodes);
    }
  }

  retrieveStandardConfig(tableName, sysId, externalNodes) {
    this.validateInput(tableName, sysId);

    let isFloor = false;
    if (externalNodes && externalNodes.length) {
      this.configResponse = new sn_mab_api.ConfigResponse(externalNodes);
      this.configKeyStack = this.createStackFromNodes(externalNodes);
      isFloor = externalNodes[externalNodes.length - 1].isFloor;
    }

    this.processConfiguration(tableName, sysId, isFloor);
    this.configResponse.preSerialize(this.copyMode);
    return this.configResponse;
  }

  retrieveCopyConfig(tableName, sysId, parentNode) {
    this.validateInput(tableName, sysId);

    this.processConfiguration(tableName, sysId);
    this.processUiRuleActions();
    this.processParameterizedConditions();
    if (this.duplicateParent) {
      this.processParentNode(parentNode);
    }
    this.configResponse.preSerialize(this.copyMode);
    return this.configResponse;
  }

  validateInput(tableName, sysId) {
    if (!tableName || !this.validationHandler.isValidTable(tableName))
      this.errorHandler.throwBadRequestError(
        'Table name missing or does not exist: ' + tableName
      );

    if (!this.validationHandler.isGeneratedOrNormalSysId(sysId))
      this.errorHandler.throwBadRequestError(
        'SysId missing or does not exist: ' + sysId
      );

    // TODO: Use cache instead querying DAO directly
    let dao = new sn_glide_ms_api.MobileAppBuilderDAO(tableName);
    let record = dao.getRecord(sysId);
    if (record == null || !record.isValidRecord())
      this.errorHandler.throwNotFoundError(
        'Record does not exist for table: ' + tableName + ' and id: ' + sysId
      );
  }

  createStackFromNodes(externalNodes) {
    return this.configKeyStackCreator.createStackFromNodes(externalNodes);
  }

  processConfiguration(tableName, sysId, isFloor) {
    // handles the case where we want to get the tableName of a child table
    tableName = this.getSysClassName(tableName, sysId);

    // Have we already processed this node?
    let wasProcessed = this.configResponse.nodeExists(tableName, sysId);
    // Create our output node and add it to response, otherwise return on error
    let currConfigNode = this.addConfigNodeResponse(tableName, sysId);

    if (isFloor) {
      this.addConfigFloorNode(tableName, sysId);
    }
    this.addConfigNodeLink(tableName, sysId, isFloor);
    if (!currConfigNode || wasProcessed || isFloor) return;

    // Get our configMetadata
    let configMetadata = this.getConfigMetadata(tableName, sysId);

    let curNode = new ConfigKeyStackEntry(
      configMetadata.getConfigKey(),
      tableName,
      sysId
    );

    // Push ourselves onto the configKeyStack
    this.configKeyStack.push(curNode);

    if (this.copyMode) {
      this.processCurrentCopyNode(configMetadata, currConfigNode);
    } else {
      this.processCurrentNode(configMetadata, currConfigNode);
    }

    // Pop ourselves off the configKeyStack
    this.configKeyStack.pop();
  }

  getSysClassName(tableName, sysId) {
    let record = this.getConfigData(tableName, sysId);

    if (!record || !record.sys_class_name) return tableName;

    return record.sys_class_name.value;
  }

  processCurrentNode(configMetadata, currConfigNode) {
    // Handle our references first
    configMetadata.references.forEach((currReference) => {
      this.processReferences(currReference, currConfigNode);
    });

    // Handle our relationships
    configMetadata.relationships.forEach((currRelationship) => {
      this.processRelationships(currRelationship, currConfigNode);
    });
  }

  processCurrentCopyNode(configMetadata, currConfigNode) {
    this.prepForDuplicatingUiRules(currConfigNode);
    this.prepForDuplicatingParameterizedConditions(currConfigNode);
    // Get a list of descendant tables to look out for
    let descendantTablesToReuse = this.descendantsToReuse.all.concat(
      this.descendantsToReuse[this.initialCopyNode.tableName] || []
    );

    // Handle our references first
    configMetadata.references.forEach((currReference) => {
      this.processReferences(
        currReference,
        currConfigNode,
        descendantTablesToReuse
      );
    });

    // Handle our relationships
    configMetadata.relationships.forEach((currRelationship) => {
      this.processRelationships(
        currRelationship,
        currConfigNode,
        descendantTablesToReuse
      );
    });
  }

  // Strictly for duplicating UI rules, which behave differently if they're attached to sys_sg_parameter_screen
  // or sys_sg_parameter_section instead of sys_sg_view_config
  prepForDuplicatingUiRules(currConfigNode) {
    let nodeData = currConfigNode.data;
    let sysClassName = nodeData.sys_class_name.value;
    let sysId = nodeData.sys_id.value;
    // If the currConfigNode is an input associated to a form screen or section, track it
    if (sysClassName === 'sys_sg_input') {
      if (nodeData.parameter_section || nodeData.parameter_screen) {
        this.uiRuleActionTargets[nodeData.name.displayValue] = {
          sysId: sysId,
        };
      }
      // If the currConfigNode is a ui rule associated to a form screen or section, track it too
    } else if (sysClassName === 'sys_sg_ui_rule') {
      if (nodeData.parent_table.value !== 'sys_sg_view_config') {
        this.nonCardUiRulesToDuplicate.push(sysId);
      }
      // Finally also track the ui rule actions associated to non-card ui rules
    } else if (sysClassName === 'sys_sg_ui_rule_action') {
      let uiRule = nodeData.ui_rule.value;
      if (this.nonCardUiRulesToDuplicate.indexOf(uiRule) !== -1) {
        this.nonCardUiRuleActions.push({
          sysId: sysId,
          uiRule: uiRule,
          target: nodeData.target.value,
        });
      }
    }
  }

  // Strictly for duplicating records that include a parameterized condition, which references the name of an
  // item parameter
  prepForDuplicatingParameterizedConditions(currConfigNode) {
    let nodeData = currConfigNode.data;
    let sysClassName = nodeData.sys_class_name.value;
    let sysId = nodeData.sys_id.value;
    let parameterizedCondBuilderFields =
      this.parameterizedConditionBuilders[sysClassName];
    // If we know this record has a parameterized condition filled out, track it
    if (parameterizedCondBuilderFields) {
      parameterizedCondBuilderFields.forEach((condBuilderField) => {
        let conditionString = nodeData[condBuilderField]
          ? nodeData[condBuilderField].value
          : null;
        if (conditionString) {
          // A record can have more than one parameterized condition
          if (!this.parameterizedConditions[sysId]) {
            this.parameterizedConditions[sysId] = [];
          }
          this.parameterizedConditions[sysId].push({
            conditionString: conditionString,
            parentSysClassName: sysClassName,
            parentSysId: sysId,
            field: condBuilderField,
          });
        }
      });
      // Also track item parameters that have a parent with a parameterized condition
    } else if (sysClassName === 'sys_sg_item_parameter') {
      let parent = nodeData.parent.value;
      if (parent && this.parameterizedConditions[parent]) {
        this.itemParameters.push({
          sysId: sysId,
          name: nodeData.name.value,
          parent: parent,
        });
      }
    }
  }

  // Add the UI rule action exceptions to the config response
  processUiRuleActions() {
    if (!this.nonCardUiRulesToDuplicate.length) return;

    this.nonCardUiRuleActions.forEach((uiRuleAction) => {
      let targetName = uiRuleAction.target;
      let target = this.uiRuleActionTargets[targetName];
      let uiRuleActionTarget = {
        name: targetName,
        sysId: target.sysId,
      };
      this.configResponse.addUiRuleActionException(
        uiRuleActionTarget,
        uiRuleAction.sysId
      );
    });
  }

  // Add item parameter exceptions to the config response
  processParameterizedConditions() {
    if (!this.itemParameters.length) return;

    this.itemParameters.forEach((itemParameter) => {
      let parent = itemParameter.parent;
      let conditions = this.parameterizedConditions[parent];
      conditions.forEach((condition) => {
        // Only add the exception if the condition string actually includes a reference to that exception
        if (condition.conditionString.indexOf(itemParameter.name) !== -1) {
          let updatedItemParameter = Object.create(itemParameter);
          updatedItemParameter.parent = {
            sysClassName: condition.parentSysClassName,
            sysId: condition.parentSysId,
            fields: [condition.field],
          };
          updatedItemParameter.name = itemParameter.name;
          this.configResponse.addItemParameterException(
            updatedItemParameter,
            itemParameter.sysId
          );
        }
      });
    });
  }

  // Process parentNode of initialCopyNode for duplication
  processParentNode(parentNode) {
    let parentNodeToProcess = JSON.parse(parentNode[0]);
    let parentNodeTableName = parentNodeToProcess.tableName;
    let parentNodeSysId = parentNodeToProcess.sysId;

    this.validateInput(parentNodeTableName, parentNodeSysId);

    this.addConfigNodeResponse(parentNodeTableName, parentNodeSysId);
    this.configResponse.validateAndAddNodeLink(
      parentNodeTableName,
      parentNodeSysId,
      this.initialCopyNode.tableName,
      this.initialCopyNode.sysId,
      false
    );
  }

  getConfigMetadata(tableName, sysId) {
    let configMetadata = this.configKeyFactory
      .getGenerator(tableName)
      .getTreeConfigurationViaSysId(sysId);
    if (!configMetadata) {
      gs.warn(
        gs.getMessage(
          'ConfigRetrievalService was unable to retrieve the config metadata for table: {0}, id: {1}',
          tableName,
          sysId
        )
      );
      // Get empty config metadata
      configMetadata = new sn_mab_api.TreeConfigurationNode();
    }
    return configMetadata;
  }

  processReferences(currReference, configNode, descendantTablesToReuse) {
    // Verify that the referenced field exists and extract its tableName
    let refTableName = undefined;
    let refSysId = undefined;
    let nodeData = configNode.data;

    if (nodeData && nodeData[currReference.name]) {
      refTableName = nodeData[currReference.name].referenceTable;
      refSysId = nodeData[currReference.name].value;
    }

    if (!refTableName || !refSysId) {
      gs.warn(
        gs.getMessage(
          'ConfigRetrievalService was unable to retrieve the reference: {0} for table: {1}, id: {2}',
          currReference.name,
          configNode.tableName,
          configNode.sysId
        )
      );
      return;
    }

    const isDuplicating =
      this.copyMode && currReference?.conditional?.isDuplicating;
    // Nodes that don't have to be retrieved, or are hidden from the content tree
    if (
      this.hideFromContentTreeNodes.indexOf(refTableName) != -1 &&
      !isDuplicating
    ) {
      return;
    }

    // Booleans for floorNode escapes
    let shouldIgnoreConditional = false;
    let shouldAlwaysFloor = false;

    // Which are only set if we're copying
    if (this.copyMode) {
      // While we're copying, either we're copying a record and all of its children, therefore needing to ignore any potential floorNoding
      shouldIgnoreConditional =
        descendantTablesToReuse.indexOf(refTableName) === -1;
      // ...or we're reusing an existing record and all of its children. Instead of returning any children records, we'll just treat that
      // reused record as a floorNode
      shouldAlwaysFloor = !shouldIgnoreConditional;
    }

    refSysId = refSysId.split(',');
    refSysId.forEach((referenceSysId) => {
      if (!referenceSysId || referenceSysId.length <= 0) return;

      if (shouldAlwaysFloor) {
        this.processConfiguration(refTableName, referenceSysId, true);
      } else if (!currReference.conditional || shouldIgnoreConditional) {
        this.processConfiguration(refTableName, referenceSysId, false);
      } else {
        // Conditional evaluated to true, so process next node
        if (
          this.evaluateConditional(
            currReference.conditional,
            refTableName,
            referenceSysId
          )
        ) {
          this.processConfiguration(refTableName, referenceSysId, false);
          // Conditional evaluated to false but a conditional existed, so we process direct children
        } else {
          this.processConfiguration(refTableName, referenceSysId, true);
        }
      }
    });
  }

  evaluateConditional(conditional, tableName, sysId) {
    let configMetadata = this.getConfigMetadata(tableName, sysId);
    let evaluation = false;

    // If we find the metadata we can try the conditional evaluation
    if (
      configMetadata &&
      this.evaluateCondition(conditional, this.configKeyStack, configMetadata)
    )
      evaluation = true;

    return evaluation;
  }

  evaluateCondition(conditional, configKeyStack, configMetadata) {
    return ConditionalEvaluator.evaluate(
      conditional,
      configKeyStack,
      configMetadata
    );
  }

  getConfigData(tableName, sysId) {
    let recordCacheId = tableName + '_' + sysId;
    if (!this.recordCache[recordCacheId]) {
      this.recordCache[recordCacheId] = this.daoCache
        .getDAO(tableName)
        .getRecord(sysId);
    }
    return this.recordCache[recordCacheId];
  }

  processRelationships(currRelationship, configNode, descendantTablesToReuse) {
    // Verify that the reference fields exist and extract them
    let refTableName = currRelationship.remoteTableName;
    let refLocalSysIdField = currRelationship.localRefFieldName;
    let refRemoteSysIdField = currRelationship.remoteRefFieldName;
    let isM2MTable = refLocalSysIdField ? true : false;

    if (!refTableName || !refRemoteSysIdField) {
      gs.warn(
        gs.getMessage(
          'ConfigRetrievalService was unable to process the relationship: {0} for table: {1}, id: {2}',
          currRelationship.name,
          configNode.tableName,
          configNode.sysId
        )
      );
      return;
    }

    const isDuplicating =
      this.copyMode && currRelationship?.conditional?.isDuplicating;
    // Nodes that don't have to be retrieved, or are hidden from the content tree
    if (
      this.hideFromContentTreeNodes.indexOf(refTableName) != -1 &&
      !isDuplicating
    ) {
      return;
    }

    let encodedQuery =
      (isM2MTable ? refLocalSysIdField : refRemoteSysIdField) +
      '=' +
      configNode.sysId;
    let relationshipEntries = this.daoCache
      .getDAO(refTableName)
      .getRecordsByEncodedQuery(encodedQuery);
    // No records were found that match - we return
    if (!relationshipEntries) return;

    // Iterate through each M2M or 1-2-M table's entries
    relationshipEntries.forEach((currEntry) => {
      let resolvedTableName = refTableName;
      let resolvedSysId = currEntry.sys_id.value;
      let m2mTableName = resolvedTableName;
      let m2mTableSysId = resolvedSysId;

      if (isM2MTable) {
        // If we have an M2M table we need to follow the refRemoteSysIdField to get our node
        if (currEntry[refRemoteSysIdField]) {
          resolvedTableName = this.getRefTableName(
            currEntry,
            refRemoteSysIdField
          );
          resolvedSysId = currEntry[refRemoteSysIdField].value;
        } else {
          // This else block handles an M2M node without a child, so the currEntry(refRemoteSysIdField) check fails because it is undefined
          this.addConfigNodeResponse(m2mTableName, m2mTableSysId);
          this.addConfigNodeLink(m2mTableName, m2mTableSysId);
          this.addEmptyM2MAlert(m2mTableName);
          return;
        }
      }

      // If we can't figure out the resolved tableName/sysId we break out
      if (!resolvedTableName || !resolvedSysId) return;

      // Booleans for floorNode escapes
      let shouldIgnoreConditional = false;
      let shouldAlwaysFloor = false;

      // Which are only set if we're copying
      if (this.copyMode) {
        // While we're copying, either we're copying a record and all of its children, therefore needing to ignore any potential floorNoding
        shouldIgnoreConditional =
          descendantTablesToReuse.indexOf(refTableName) === -1;
        // ...or we're reusing an existing record and all of its children. Instead of returning any children records, we'll just treat that
        // reused record as a floorNode
        shouldAlwaysFloor = !shouldIgnoreConditional;
      }

      let isFloor = false;

      if (currRelationship.conditional && !shouldIgnoreConditional) {
        if (
          shouldAlwaysFloor ||
          !this.evaluateConditional(
            currRelationship.conditional,
            resolvedTableName,
            resolvedSysId
          )
        ) {
          isFloor = true;
        }
      }

      // If we have an M2M, push the M2M onto the stack and output
      if (isM2MTable) {
        this.addConfigNodeResponse(m2mTableName, m2mTableSysId);
        this.addConfigNodeLink(m2mTableName, m2mTableSysId);
        // Add a floor node if there is an M2M that we want to floor
        if (isFloor) {
          this.addConfigFloorNode(m2mTableName, m2mTableSysId);
        }
        // Get our configMetadata
        let m2mConfigMetadata = this.getConfigMetadata(
          m2mTableName,
          m2mTableSysId
        );
        // Push ourselves onto the configKeyStack
        this.configKeyStack.push(
          new ConfigKeyStackEntry(
            m2mConfigMetadata.getConfigKey(),
            m2mTableName,
            m2mTableSysId
          )
        );
      }

      // Only process our main node if there isn't an M2M that we want to floor
      if (!isM2MTable || (isM2MTable && !isFloor)) {
        this.processConfiguration(resolvedTableName, resolvedSysId, isFloor);
      }

      // Pop the M2M from the stack if it exists
      if (isM2MTable) this.configKeyStack.pop();
    });
  }

  getParentNode() {
    if (this.configKeyStack.length)
      return this.configKeyStack[this.configKeyStack.length - 1];
  }

  getRefTableName(record, refFieldName) {
    let refField = record[refFieldName];
    let refTable = null;
    if (refField.type === 'reference') refTable = refField.referenceTable;
    else if (refField.type === 'document_id') {
      let dependentField = this.getDepFieldRefTableName(
        record.sys_class_name.value,
        refFieldName
      );
      refTable = dependentField ? record[dependentField].value : null;
    }

    if (!refTable)
      gs.warn(
        gs.getMessage(
          'ConfigRetrievalService was unable to get reference table for field {0} on table {1}',
          refFieldName,
          record.sys_class_name.value
        )
      );

    return refTable;
  }

  getDepFieldRefTableName(table, fieldName) {
    let dependent = null;
    let dict = new GlideRecordSecure('sys_dictionary');
    dict.addQuery('name', table);
    dict.addQuery('element', fieldName);
    dict.query();

    if (dict.next()) dependent = dict.getValue('dependent');

    return dependent;
  }

  addEmptyM2MAlert(m2mTableName) {
    // Logging a warning if m2m table name isn't provided but continue to provide a warning for the FE
    let childTable = '';
    if (!m2mTableName)
      gs.warn(
        gs.getMessage(
          'Returning addEmptyM2MAlert with incomplete data for alertData.childTable'
        )
      );
    else childTable = m2mTableName;

    let parentNode = this.getParentNode();
    if (parentNode) {
      let missingM2MChildAlertFlag =
        this.alertHandler.generateMissingM2MChildAlert(
          parentNode.tableName,
          parentNode.sysId,
          m2mTableName
        );
      this.configResponse.addAlert(missingM2MChildAlertFlag);
    }
  }

  // Find the node or it is not accessible then return and log it
  validateConfigData(tableName, sysId) {
    let configData = this.getConfigData(tableName, sysId);
    if (!configData) {
      this.addUnretrievableNodeAlert(tableName, sysId);
      gs.warn(
        gs.getMessage(
          'ConfigRetrievalService was unable to retrieve the node for table: {0}, id: {1}',
          tableName,
          sysId
        )
      );
      return false;
    }
    return true;
  }

  addConfigNodeLink(tableName, sysId, isFloor) {
    let configNode = this.configResponse.getConfigNode(tableName, sysId);
    if (!configNode && !this.validateConfigData(tableName, sysId)) {
      return;
    }
    // If we are not the root node we add the link
    let parentNode = this.getParentNode();
    if (parentNode)
      this.configResponse.validateAndAddNodeLink(
        parentNode.tableName,
        parentNode.sysId,
        tableName,
        sysId,
        isFloor
      );
  }

  addConfigFloorNode(tableName, sysId) {
    let configNode = this.configResponse.getConfigNode(tableName, sysId);
    if (!configNode && !this.validateConfigData(tableName, sysId)) {
      return;
    }
    // If we are not the root node we add the link
    let parentNode = this.getParentNode();
    if (parentNode)
      this.configResponse.addFloorNode(
        parentNode.tableName,
        parentNode.sysId,
        tableName,
        sysId
      );
  }

  addConfigNodeResponse(tableName, sysId) {
    let configNode = this.configResponse.getConfigNode(tableName, sysId);
    // Check our response to see if we already have output this node
    if (!configNode) {
      let configData = this.getConfigData(tableName, sysId);

      if (!configData) {
        if (!this.validationHandler.isRecordGloballyScoped(tableName, sysId)) {
          this.addUnretrievableNodeAlert(tableName, sysId);
          gs.warn(
            gs.getMessage(
              'ConfigRetrievalService was unable to retrieve the node for table: {0}, id: {1}',
              tableName,
              sysId
            )
          );
        }

        return;
      }

      this.configResponse.addConfigNode(tableName, sysId, configData);
      configNode = {
        data: configData,
        tableName: tableName,
        sysId: sysId,
      };
    }

    return configNode;
  }

  addUnretrievableNodeAlert(tableName, sysId) {
    let alert = this.configResponse.getAlert(tableName, sysId);
    if (!alert) {
      let unretrievableNodeAlert =
        this.alertHandler.generateUnretrievableNodeAlert(tableName, sysId);
      this.configResponse.addAlert(unretrievableNodeAlert);
    }
  }
}

class ConfigKeyStackEntry {
  constructor(configKey, tableName, sysId) {
    if (!configKey || !tableName || !sysId)
      new ErrorHandler().throwInternalError(
        'Error - NodeStackEntry not defined correctly'
      );

    this.configKey = configKey;
    this.tableName = tableName;
    this.sysId = sysId;
  }
}

module.exports = ConfigRetrievalService;
