class EnhancedRecordConfigService {
  constructor(root, descendants, additionalFieldsToUpdate) {
    this.errorHandler = new sn_mab_api.ErrorHandler();
    const rootCount = Object.keys(root).length;
    if (rootCount !== 1) {
      this.errorHandler.throwBadConfigError(
        gs.getMessage(
          "Root should be exactly one record. Found {0} records", rootCount
        )
      );
    }

    const rootTableName = Object.keys(root)[0];
    const rootSysId = Object.keys(root[rootTableName])[0];
    const rootTemplateValues = root[rootTableName][rootSysId];
    const rootName = rootTemplateValues.name.value;
    this.root = {
      tableName: rootTableName,
      sysId: rootSysId,
      templateValues: rootTemplateValues,
      name: rootName,
    };

    this.descendants = descendants;
    this.additionalFieldsToUpdate = additionalFieldsToUpdate;
    this.linkingRecords = {};
  }

  /**
   * fetches the config metadata for the given table from sys_sg_mobile_builder_config
   * @param {string} tableName
   * @returns {object}
   */
  getConfigMetadata(tableName) {
    return new sn_mab_api.ConfigKeyDAO().getTreeConfigByConfigKeys([tableName]);
  }

  /**
   * fetches the template config for the given table
   * @param {string} tableName
   * @param {object} overrideValues
   * @returns {object} response from retrieveConfigTemplate API
   */
  retrieveConfigTemplate(tableName, overrideValues) {
    return new sn_mab_api.TemplateConfigRetrievalService().retrieveConfigTemplate(
      tableName,
      overrideValues
    );
  }

  /**
   * fetches the config for the given table and sys_id
   * @param {string} tableName
   * @param {string} sysId
   * @param {object} externalNodes
   * @param {object} parentNode
   * @returns {object} response from retrieveConfig API
   */
  retrieveConfig(tableName, sysId, externalNodes, parentNode) {
    return new sn_mab_api.ConfigRetrievalService().retrieveConfig(
      tableName,
      sysId,
      externalNodes,
      parentNode
    );
  }

  /**
   * inserts, updates, and deletes records based on the payload
   * @param {object} payload
   * @returns {object} response from UpdateConfigurationService API
   */
  updateConfiguration(payload) {
    return new sn_mab_api.UpdateConfigurationService().processRecords(payload);
  }

  /**
   * fetches the value from an existing record by table, sys_id, and fieldName
   * @param {string} tableName
   * @param {string} sysId
   * @param {string} fieldName
   * @returns {object}
   */

  getValueFromGlideRecord(tableName, sysId, fieldName) {
    const grs = new GlideRecordSecure(tableName);
    grs.get(sysId);

    return new sn_mab_api.MobileAppBuilderDAO(tableName).getValuesForElement(
      grs,
      fieldName
    );
  }

  /**
   * @returns {object} the nodes and nodeLinks of all the records between root table and its descendants (including)
   * following the path defined in enhanced_record_config field of sys_sg_mobile_builder_config
   */
  processEnhancedConfiguration() {
    const rootRecordConfigMetadata = this.getConfigMetadata(
      this.root.tableName
    );
    if (
      !rootRecordConfigMetadata ||
      !rootRecordConfigMetadata.enhancedRecordConfig
    ) {
      this.errorHandler.throwBadConfigError(
        gs.getMessage(
          "Unable to fetch the enhanced record config for table: {0}", this.root.tableName
        )
      );
      return;
    }

    this.enhancedRecordConfig = rootRecordConfigMetadata.enhancedRecordConfig;
    return {
      ...this.processCurrentNode(
        this.root.tableName,
        this.root.sysId,
        this.root.templateValues
      ),
      alerts: [],
      linkingRecords: this.linkingRecords,
    };
  }

  /**
   * converts from snake case to camel case
   * @param {string} snakeCaseInput
   * @returns {string}
   */
  snakeToCamel(snakeCaseInput) {
    const SNAKE_CASE_PATTERN = /([-_][a-z])/g;
    if (!SNAKE_CASE_PATTERN.test(snakeCaseInput)) return snakeCaseInput;

    return snakeCaseInput
      .toLowerCase()
      .replace(SNAKE_CASE_PATTERN, (group) =>
        group.toUpperCase().replace('-', '').replace('_', '')
      );
  }

  /**
   * checks if the type of the input is an object
   * @param {*} value
   * @returns {boolean}
   */
  isObject(value) {
    return value && typeof value === 'object' && value.constructor === Object;
  }

  /**
   * determines if the input sys_id is a new record
   * @param {string} sysId
   * @returns {boolean}
   */
  isNewRecord(sysId) {
    const NEW_RECORD_PATTERN = /new_([0-9a-f]{32})/g;
    return NEW_RECORD_PATTERN.test(sysId);
  }

  /**
   * @param {object} existingNodes
   * @param {Array<object>} newNodesList
   * @returns {object}
   */
  mergeNodes(existingNodes, ...newNodesList) {
    const allEntries = newNodesList.flatMap(Object.entries);
    return allEntries.reduce((mergedNodes, [tableName, newRecords]) => {
      mergedNodes[tableName] = {
        ...(mergedNodes[tableName] || {}),
        ...newRecords,
      };
      return mergedNodes;
    }, existingNodes);
  }

  /**
   * adds a new node to the linkingRecords given the table and sysId
   * @param {string} tableName
   * @param {string} sysId
   */
  addToLinkingRecords(tableName, sysId) {
    this.linkingRecords = {
      ...this.linkingRecords,
      [tableName]: {
        ...this.linkingRecords[tableName],
        [sysId]: true,
      },
    };
  }

  /**
   * replaces the old sys_id with the new sys_id in linkingRecords after save
   * @param {object} saveResponse - response from UpdateConfigurationService for created records for enhanced config
   */
  updateLinkingRecordsOnSave(saveResponse) {
    const updatedLinkingRecords = {};
    Object.entries(this.linkingRecords).forEach(([tableName, records]) => {
      updatedLinkingRecords[tableName] = {};
      Object.keys(records).forEach((oldSysId) => {
        if (oldSysId in saveResponse) {
          const newSysId = saveResponse[oldSysId].sys_id;
          updatedLinkingRecords[tableName][newSysId] = true;
        } else {
          updatedLinkingRecords[tableName][oldSysId] = true;
        }
      });
    });
    this.linkingRecords = updatedLinkingRecords;
  }

  /**
   * Saves the new records between(and including) root and descendants following
   * the path defined in enhanced_record_config field of sys_sg_mobile_builder_config
   * @returns {object} response from UpdateConfigurationService for created records for enhanced config
   */
  saveEnhancedRecords() {
    const { nodes } = this.processEnhancedConfiguration();
    const inserts = {};

    Object.keys(nodes).forEach((tableName) => {
      const camelCasedTableName = this.snakeToCamel(tableName);
      const currentTableNodes = {};
      // a flag to ensure only tables with new records are inserted
      let newRecordFlag = false;

      Object.keys(nodes[tableName]).forEach((sysId) => {
        if (!this.isNewRecord(sysId)) return;
        newRecordFlag = true;
        currentTableNodes[sysId] = nodes[tableName][sysId];
      });

      if (newRecordFlag) inserts[camelCasedTableName] = currentTableNodes;
    });

    const payload = {
      inserts,
      updates: {},
      deletes: {},
    };

    const saveResponse = this.updateConfiguration(payload);
    this.updateLinkingRecordsOnSave(saveResponse);
    const rootSysId = saveResponse[this.root.sysId].sys_id;
    const config = this.retrieveConfig(this.root.tableName, rootSysId, {}, {});

    return { saveResponse, linkingRecords: this.linkingRecords, config };
  }

  /**
   * same logic as in MAB, but with an alternative to Array.from() since that wasn't working
   * @returns {string} new sys_id
   */
  generateNewRecordId() {
    const s4 = () => {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    };

    const s4NTimes = (n) => {
      // alternative to Array.from() logic
      const newArray = [];
      for (let i = 0; i < n; i++) {
        newArray.push(s4());
      }
      return newArray.join('');
    };

    const guid = () => {
      return [2, 1, 1, 1, 3].map(s4NTimes).join('');
    };

    return `new_${guid()}`;
  }

  /**
   * fetches the field type of the given field on the given table
   * @param {string} tableName
   * @param {string} fieldName
   * @returns {string}
   */
  getFieldType(tableName, fieldName) {
    const gr = new GlideRecord(tableName);
    const fieldType = gr.getElement(fieldName).getED().getInternalType();
    if (!fieldType)
      this.errorHandler.throwBadConfigError(
        gs.getMessage(
          "Error in getFieldType: Invalid type for field {0} on table {1}", fieldName, tableName
        )
      );

    return fieldType;
  }

  /**
   * fetches the label of the given table
   * @param {string} tableName
   * @returns {string} Label of the table. Eg: Record screen for sys_sg_form_screen
   */
  getTableDisplayValue(tableName) {
    const gr = new GlideRecord(tableName);
    return gr.getClassDisplayValue();
  }

  /**
   * checks if the record should be renamed
   * @param {string} table
   * @param {string} sysId
   * @param {object} templateValues
   * @returns {boolean}
   */
  shouldRename(table, sysId, templateValues) {
    const isRoot = sysId === this.root.sysId;

    const nameInAdditionalFieldsToUpdate =
      this.additionalFieldsToUpdate &&
      table in this.additionalFieldsToUpdate &&
      'name' in this.additionalFieldsToUpdate[table];

    const nameInTemplateValues = 'name' in templateValues;

    const gr = new GlideRecord(table);
    const nameFieldExistsInTable = gr.isValidField('name');

    return (
      this.isNewRecord(sysId) &&
      nameFieldExistsInTable &&
      !nameInAdditionalFieldsToUpdate &&
      !isRoot &&
      !nameInTemplateValues
    );
  }

  /**
   * generates the template value used for renaming the new records based on the name of root record
   * @param {string} table
   * @param {string} sysId
   * @param {object} templateValues
   * @returns {object} template value used for renaming the linking nodes based on the name of root record
   */
  generateNameTemplateValue(table, sysId, templateValues) {
    if (!this.shouldRename(table, sysId, templateValues)) return {};

    const tableDisplayValue = this.getTableDisplayValue(table);
    const name = `${this.root.name} - ${tableDisplayValue}`;
    const type = this.getFieldType(table, 'name');
    return {
      name: {
        displayValue: name,
        type,
        value: name,
      },
    };
  }

  /**
   * Override values are passed to retrieveConfigTemplate to override specific fields on the retrived template.
   * To be passed as params to retrieveConfigTemplate method in TemplateConfigRetrievalService
   * @param {string} sysId
   * @param {object} templateValues
   * @returns {object} template values to be passed to retrieveConfigTemplate API
   */
  generateOverrideValues(table, sysId, templateValues) {
    const sysClassNameDisplayValue = this.getTableDisplayValue(table);
    const nameTemplateValue = this.generateNameTemplateValue(
      table,
      sysId,
      templateValues
    );

    return {
      sys_id: sysId,
      templateValues: {
        // frontend logic for displaying the 'name' field on the content tree instead of '(empty)' requires sys_class_name
        sys_class_name: {
          displayValue: sysClassNameDisplayValue,
          type: 'sys_class_name',
          value: table,
        },
        ...templateValues,
        ...nameTemplateValue,
      },
    };
  }

  /**
   * Override map for the reference record table name.
   * Eg: The reference record table name for embedded_screen on sys_sg_master_item
   * is sys_sg_screen by default. We need to override it with sys_sg_form_screen
   */
  referenceRecordTableMapping = {
    sys_sg_master_item: {
      embedded_screen: 'sys_sg_form_screen',
    },
    sys_sg_form_segment: {
      embedded_screen__details_screen: 'sys_sg_details_screen',
    },
  };

  /**
   * When given the table name of parent and the column name of the reference on parent, it returns the table name of the reference
   * For example, if the parent table is 'sys_sg_list_screen' and the column name is 'icon', it returns 'sys_sg_icon'
   * @param {string} parentTableId - combination of table name and identification of the record.
   * eg: sys_sg_form_segment__details_screen, sys_sg_form_segment__activity_stream_screen
   * @param {string} columnNameOnParent
   * @returns {string} table name of a reference on the given table
   */
  getReferenceRecordTableName(parentTableId, columnNameOnParent) {
    const [parentTableName, id] = parentTableId.split('__');

    const fieldKey = id ? `${columnNameOnParent}__${id}` : columnNameOnParent;
    if (
      parentTableName in this.referenceRecordTableMapping &&
      fieldKey in this.referenceRecordTableMapping[parentTableName]
    ) {
      // The reference record table name for embedded_screen on sys_sg_master_item
      // is sys_sg_screen by default. We need to override it with sys_sg_form_screen
      return this.referenceRecordTableMapping[parentTableName][fieldKey];
    }

    const parentGlideRecord = new GlideRecord(parentTableName);
    const isValidField = parentGlideRecord.isValidField(columnNameOnParent);
    if (!isValidField) return '';

    const columnElementOnParent =
      parentGlideRecord.getElement(columnNameOnParent);
    const referenceRecord = columnElementOnParent.getRefRecord();
    if (!referenceRecord || Object.keys(referenceRecord).length === 0)
      return '';
    const referenceRecordTableName = referenceRecord.getTableName();

    if (!referenceRecordTableName) return '';

    return referenceRecordTableName;
  }

  /**
   * empty nodes imply that the descendants from the input cannot be reached
   * @param {object} nodes
   * @returns {boolean}
   */
  areDescendantsReachable(nodes) {
    return nodes && Object.keys(nodes).length > 0;
  }

  /**
   * parent ---> referenceRecord
   * @param {string} referenceRecordTableName
   * @param {string} parentTableId - combination of tableName and identification (eg: sys_sg_form_segment__details_screen)
   * some fields such as 'embedded_screen' on sys_sg_form_segment need identification such as details_screen or activity_stream_screen
   * @param {string} parentSysId
   * @returns {object} nodes and nodeLinks of the reference record and its descendants, and the metadata of the reference field on the parent
   */
  processReferenceNode(referenceRecordTableName, parentTableId, parentSysId) {
    const [parentTableName] = parentTableId.split('__');
    const { references: parentReferences = [] } =
      this.getConfigMetadata(parentTableName);

    // get the reference of remote record from the references of parent in sys_sg_mobile_builder_config
    const matchedReference = parentReferences.find((reference) => {
      const columnName = reference.name;
      const tableName = this.getReferenceRecordTableName(
        parentTableId,
        columnName
      );
      return tableName === referenceRecordTableName;
    });

    if (!matchedReference) {
      this.errorHandler.throwBadConfigError(
        gs.getMessage(
          "Invalid enhanced record config: Unable to find the reference record {0} in the references of the parent table {1}", referenceRecordTableName, parentTableName
        )
      );
    }

    const columnNameOnParent = matchedReference.name;

    // Get sys_id and template values of the reference record if it's a descendant, else generate new sys_id
    let referenceRecordSysId,
      templateValues = {};
    if (referenceRecordTableName in this.descendants) {
      if (Object.keys(this.descendants[referenceRecordTableName]).length !== 1)
        this.errorHandler.throwBadConfigError(
          gs.getMessage(
            "More than one descendant record found for the reference record {0} in the descendants of the parent table {1}", referenceRecordTableName, parentTableName
          )
        );

      referenceRecordSysId = Object.keys(
        this.descendants[referenceRecordTableName]
      )[0];
      templateValues =
        this.descendants[referenceRecordTableName][referenceRecordSysId] || {};
    } else {
      referenceRecordSysId = this.generateNewRecordId();
    }

    const { nodes, nodeLinks: descendantNodeLinks } = this.processCurrentNode(
      referenceRecordTableName,
      referenceRecordSysId,
      templateValues
    );

    // empty nodes implies that the descendants from the input cannot be reached
    // via current reference node
    if (!this.areDescendantsReachable(nodes))
      return { nodes: {}, nodeLinks: [], currentReferenceMetadata: {} };

    const currentReferenceNodeLink = {
      parentNode: {
        tableName: parentTableName,
        sysId: parentSysId,
      },
      childNode: {
        tableName: referenceRecordTableName,
        sysId: referenceRecordSysId,
        isFloor: false,
      },
    };
    const nodeLinks = [...descendantNodeLinks, currentReferenceNodeLink];

    // override the value of reference field on parent with the sys_id of the reference record
    const currentReferenceMetadata = {
      [columnNameOnParent]: {
        displayValue: '',
        type: 'reference',
        value: referenceRecordSysId,
      },
    };

    return {
      nodes,
      nodeLinks,
      currentReferenceMetadata,
    };
  }

  /**
   * parent <--- remoteRef
   * @param {string} remoteRefTableId - combination of table name and identification of the record.
   * eg: sys_sg_form_segment__details_screen, sys_sg_form_segment__activity_stream_screen
   * @param {string} remoteRefSysId
   * @param {string} remoteRefFieldName
   * @param {string} parentTableName
   * @param {string} parentSysId
   * @param {object} templateValues - template values for new records
   * @returns nodes and nodeLinks of the remoteRef record and its descendants
   */
  processType2RelationshipNode(
    remoteRefTableId,
    remoteRefSysId,
    remoteRefFieldName,
    parentTableName,
    parentSysId,
    templateValues = {}
  ) {
    const [remoteRefTableName] = remoteRefTableId.split('__');
    // override the value of field corresponding to the parent table on the relationship record with the sys_id of the parent record
    const relationshipOverrideMetadata = {
      ...templateValues,
      [remoteRefFieldName]: {
        displayValue: '',
        type: 'reference',
        value: parentSysId,
      },
    };
    const { nodes: remoteRefNodes, nodeLinks: remoteRefNodeLinks } =
      this.processCurrentNode(
        remoteRefTableId,
        remoteRefSysId,
        relationshipOverrideMetadata
      );

    // empty remoteRefNodes implies that the descendants from the input cannot
    // be reached via current relationship node
    if (!this.areDescendantsReachable(remoteRefNodes))
      return { nodes: {}, nodeLinks: [] };

    /**
     * node link between parent record and remoteRef record
     */
    const parentAndRemoteRefNodeLink = {
      parentNode: {
        tableName: parentTableName,
        sysId: parentSysId,
      },
      childNode: {
        tableName: remoteRefTableName,
        sysId: remoteRefSysId,
        isFloor: false,
      },
    };

    return {
      nodes: remoteRefNodes,
      nodeLinks: [...remoteRefNodeLinks, parentAndRemoteRefNodeLink],
    };
  }

  /**
   * generates the nodes for the m2m record and the node link between m2m record and remoteRef record
   * @param {string} m2mRecordTableName
   * @param {string} m2mRecordSysId
   * @param {string} remoteRefTableName
   * @param {string} remoteRefSysId
   * @param {string} remoteRefFieldName
   * @param {string} localRefSysId
   * @param {string} localRefFieldName
   * @param {object} templateValues
   * @returns nodes and nodeLinks for m2m record
   */
  generateM2mRecordConfigTemplate(
    m2mRecordTableName,
    m2mRecordSysId,
    remoteRefTableName,
    remoteRefSysId,
    remoteRefFieldName,
    localRefSysId,
    localRefFieldName,
    templateValues = {}
  ) {
    // override the value of localRef field and remoteRef field on m2m record with their corresponding sys_ids
    const relationshipOverrideMetadata = {
      ...templateValues,
      [localRefFieldName]: {
        displayValue: '',
        type: 'reference',
        value: localRefSysId,
      },
      [remoteRefFieldName]: {
        displayValue: '',
        type: 'reference',
        value: remoteRefSysId,
      },
    };
    const overrideValues = this.generateOverrideValues(
      m2mRecordTableName,
      m2mRecordSysId,
      relationshipOverrideMetadata
    );
    const { nodes: m2mNodes } = this.retrieveConfigTemplate(
      m2mRecordTableName,
      overrideValues
    );
    /**
     * node link between m2m record and remoteRef record
     */
    const m2mAndRemoteRefNodeLink = {
      parentNode: {
        tableName: m2mRecordTableName,
        sysId: m2mRecordSysId,
      },
      childNode: {
        tableName: remoteRefTableName,
        sysId: remoteRefSysId,
        isFloor: false,
      },
    };
    return {
      m2mNodes,
      m2mAndRemoteRefNodeLink,
    };
  }

  /**
   * localRef(parent) <--- m2mRecord ---> remoteRef
   * @param {object} relationship relationship as defined in sys_sg_mobile_builder_config
   * @param {string} remoteRefSysId
   * @param {string} parentTableName
   * @param {string} parentSysId
   * @param {object} templateValues
   * @returns {object} nodes and nodeLinks of the m2m record, remoteRef record, and the descendants of remoteRef record
   */
  processM2mRelationshipNode(
    relationship,
    remoteRefSysId,
    parentTableName,
    parentSysId,
    templateValues
  ) {
    const m2mRecordTableName = relationship.remoteTableName;
    const localRefFieldName = relationship.localRefFieldName;
    const remoteRefFieldName = relationship.remoteRefFieldName;
    const remoteRefTableName = this.getReferenceRecordTableName(
      m2mRecordTableName,
      remoteRefFieldName
    );

    const { nodes: remoteRefNodes, nodeLinks: remoteRefNodeLinks } =
      this.processCurrentNode(remoteRefTableName, remoteRefSysId, {});

    // empty remoteRefNodes implies that the descendants from the input cannot
    // be reached via current relationship node
    if (!this.areDescendantsReachable(remoteRefNodes))
      return { nodes: {}, nodeLinks: [] };

    const m2mRecordSysId = this.generateNewRecordId();
    const { m2mNodes, m2mAndRemoteRefNodeLink } =
      this.generateM2mRecordConfigTemplate(
        m2mRecordTableName,
        m2mRecordSysId,
        remoteRefTableName,
        remoteRefSysId,
        remoteRefFieldName,
        parentSysId,
        localRefFieldName,
        templateValues
      );
    /**
     * node link between parent record and m2m record
     */
    const parentAndM2mNodeLink = {
      parentNode: {
        tableName: parentTableName,
        sysId: parentSysId,
      },
      childNode: {
        tableName: m2mRecordTableName,
        sysId: m2mRecordSysId,
        isFloor: false,
      },
    };

    return {
      nodes: this.mergeNodes(remoteRefNodes, m2mNodes),
      nodeLinks: [
        ...remoteRefNodeLinks,
        m2mAndRemoteRefNodeLink,
        parentAndM2mNodeLink,
      ],
    };
  }

  /**
   * calls either processM2mRelationshipNode or processType2RelationshipNode based on the relationship type
   * @param {object} matchedRelationship
   * @param {string} remoteRecordTableId - combination of table name and identification of the record.
   * eg: sys_sg_form_segment__details_screen, sys_sg_form_segment__activity_stream_screen
   * @param {string} remoteRecordSysId
   * @param {string} parentTableName
   * @param {string} parentSysId
   * @param {object} templateValues
   * @returns {object} nodes & nodeLinks
   */
  processRelationshipNode(
    matchedRelationship,
    remoteRecordTableId,
    remoteRecordSysId,
    parentTableName,
    parentSysId,
    templateValues = {}
  ) {
    const isM2MTable = !!matchedRelationship.localRefFieldName;

    if (isM2MTable) {
      return this.processM2mRelationshipNode(
        matchedRelationship,
        remoteRecordSysId,
        parentTableName,
        parentSysId,
        templateValues
      );
    }

    const { remoteRefFieldName } = matchedRelationship;
    return this.processType2RelationshipNode(
      remoteRecordTableId,
      remoteRecordSysId,
      remoteRefFieldName,
      parentTableName,
      parentSysId,
      templateValues
    );
  }

  /**
   * calls processRelationshipNode for each record under the remoteRefTable
   * @param {string} remoteRecordTableId - combination of table name and identification of the record.
   * eg: sys_sg_form_segment__details_screen, sys_sg_form_segment__activity_stream_screen
   * @param {string} parentTableName
   * @param {string} parentSysId
   * @returns {object} nodes and nodeLinks of the relationship and its descendants
   */
  processRelationshipNodes(remoteRecordTableId, parentTableName, parentSysId) {
    const [remoteRecordTableName] = remoteRecordTableId.split('__');
    const { relationships: parentRelationships = [] } =
      this.getConfigMetadata(parentTableName);

    // get the relationship of remote record from the relationships of parent in sys_sg_mobile_builder_config
    const matchedRelationship = parentRelationships.find((relationship) => {
      return relationship.remoteTableName === remoteRecordTableName;
    });
    if (!matchedRelationship) {
      this.errorHandler.throwBadConfigError(
        gs.getMessage(
          "Invalid enhanced record config: Unable to find the relationship record {0} in the relationships of the parent table {1}",
          remoteRecordTableId,
          parentTableName
        )
      );
      return;
    }

    if (!(remoteRecordTableName in this.descendants)) {
      // Create single relationship node
      const remoteRecordSysId = this.generateNewRecordId();
      return this.processRelationshipNode(
        matchedRelationship,
        remoteRecordTableId,
        remoteRecordSysId,
        parentTableName,
        parentSysId,
        {}
      );
    }

    // Multiple descendant records can be passed for the same remoteRefTable.
    // eg: Multiple screen fields under sys_sg_details_screen
    let nodes = {};
    let nodeLinks = [];

    const sysIds = Object.keys(this.descendants[remoteRecordTableName]);

    sysIds.forEach((sysId) => {
      const templateValues = this.descendants[remoteRecordTableName][sysId];
      const { nodes: currentNodes, nodeLinks: currentNodeLinks } =
        this.processRelationshipNode(
          matchedRelationship,
          remoteRecordTableId,
          sysId,
          parentTableName,
          parentSysId,
          templateValues
        );
      nodes = this.mergeNodes(nodes, currentNodes);
      nodeLinks = [...nodeLinks, ...currentNodeLinks];
    });

    return { nodes, nodeLinks };
  }

  /**
   * Generates template values to override the additional fields(passed to the endpoint) on the current table
   * @param {string} currentTable
   * @returns {object} metadata to override the provided additional fields
   */
  generateAdditionalFieldsOverrideMetadata(currentTable) {
    const hasAdditionalFieldsForCurrentTable =
      this.additionalFieldsToUpdate &&
      currentTable in this.additionalFieldsToUpdate;
    if (!hasAdditionalFieldsForCurrentTable) {
      return [];
    }

    const additionalFieldsOverrideMetadata = {};
    const additionalFieldsForCurrentTable =
      this.additionalFieldsToUpdate[currentTable];

    Object.keys(additionalFieldsForCurrentTable).forEach((fieldName) => {
      const TABLE_FIELD_SPLIT_PATTERN = /__|-/g;
      // The value of additionalFieldsToUpdate can either be passed as a string or as a reference to another field
      // An example for pass by reference: update 'datasource_table' field on sys_sg_master_item with the value of
      // 'table' field on sys_sg_data_item. additionalFieldsForCurrentTable would be {"datasource_table": "sys_sg_data_item__table"}
      // An example for pass by value: update 'use_view_config' field on sys_sg_master_item with the value '1'.
      const isPassByReference = TABLE_FIELD_SPLIT_PATTERN.test(
        additionalFieldsForCurrentTable[fieldName]
      );

      if (!isPassByReference) {
        const value = additionalFieldsForCurrentTable[fieldName];
        const type = this.getFieldType(currentTable, fieldName);
        additionalFieldsOverrideMetadata[fieldName] = {
          displayValue: value,
          type,
          value,
        };
        return;
      }

      const [referenceTable, referenceField] =
        additionalFieldsForCurrentTable[fieldName].split('__');
      let referenceSysId;

      if (referenceTable === this.root.tableName) {
        referenceSysId = this.root.sysId;
      } else if (referenceTable in this.descendants) {
        referenceSysId = Object.keys(this.descendants[referenceTable])[0];
      } else {
        this.errorHandler.throwBadConfigError(
          gs.getMessage(
            'Invalid enhanced record config: values for additional fields should be part of root or descendant'
          )
        );
      }

      // fetch the value on the reference field for the specified sys_id on the reference table
      additionalFieldsOverrideMetadata[fieldName] =
        this.getValueFromGlideRecord(
          referenceTable,
          referenceSysId,
          referenceField
        );
    });

    return additionalFieldsOverrideMetadata;
  }

  /**
   * Descendant can either be a new record or existing record.
   * If it is a new record, then the template config is fetched. Otherwise, the config is fetched
   * @param {string} tableName
   * @param {string} sysId
   * @param {object} templateValues
   * @returns {object} nodes & nodeLinks of the descendant
   */
  processDescendant(tableName, sysId, templateValues) {
    if (this.isNewRecord(sysId)) {
      this.addToLinkingRecords(tableName, sysId);
      const overrideValues = this.generateOverrideValues(
        tableName,
        sysId,
        templateValues
      );
      return this.retrieveConfigTemplate(tableName, overrideValues);
    }

    return this.retrieveConfig(tableName, sysId, {}, {});
  }

  /**
   * Processes the current node and its descendants
   * @param {string} currentTableId
   * @param {object} relationshipOverrideMetadata
   * @returns {object} nodes and nodeLinks of current node
   */
  processCurrentNode(
    currentTableId,
    currentSysId,
    relationshipOverrideMetadata
  ) {
    const [currentTable] = currentTableId.split('__');

    if (currentTable in this.descendants) {
      return this.processDescendant(
        currentTable,
        currentSysId,
        relationshipOverrideMetadata
      );
    }

    const currentRecordConfig = this.enhancedRecordConfig[currentTableId] || {};
    const { references = [], relationships = [] } = currentRecordConfig;

    let referenceNodes = {};
    let referenceNodeLinks = [];
    let relationshipNodes = {};
    let relationshipNodeLinks = [];

    let referenceOverrideMetadata = {};

    references.forEach((referenceRecordTableName) => {
      const { nodes, nodeLinks, currentReferenceMetadata } =
        this.processReferenceNode(
          referenceRecordTableName,
          currentTableId,
          currentSysId
        );

      if (
        !currentReferenceMetadata ||
        Object.keys(currentReferenceMetadata).length === 0
      )
        return;

      referenceNodeLinks = [...referenceNodeLinks, ...nodeLinks];
      referenceNodes = this.mergeNodes(referenceNodes, nodes);
      referenceOverrideMetadata = {
        ...referenceOverrideMetadata,
        ...currentReferenceMetadata,
      };
    });

    relationships.forEach((remoteRecordTableId) => {
      // each relationship can have multiple records. eg: Multiple screen fields under sys_sg_details_screen
      const { nodes, nodeLinks } = this.processRelationshipNodes(
        remoteRecordTableId,
        currentTable,
        currentSysId
      );
      relationshipNodeLinks = [...relationshipNodeLinks, ...nodeLinks];
      relationshipNodes = this.mergeNodes(relationshipNodes, nodes);
    });

    // empty referenceNodes and relationshipNodes implies that the descendants
    // from the input cannot be reached via current node
    if (
      !this.areDescendantsReachable(referenceNodes) &&
      !this.areDescendantsReachable(relationshipNodes)
    ) {
      return {
        nodes: {},
        nodeLinks: [],
      };
    }

    if (this.isNewRecord(currentSysId) && currentSysId !== this.root.sysId) {
      this.addToLinkingRecords(currentTable, currentSysId);
    }

    const additionalFieldsMetadata =
      this.generateAdditionalFieldsOverrideMetadata(currentTable);

    const overrideValues = this.generateOverrideValues(
      currentTable,
      currentSysId,
      {
        ...referenceOverrideMetadata,
        ...relationshipOverrideMetadata,
        ...additionalFieldsMetadata,
      }
    );

    const { nodes: currentTableNode } = this.retrieveConfigTemplate(
      currentTable,
      overrideValues
    );

    return {
      nodes: this.mergeNodes(
        referenceNodes,
        relationshipNodes,
        currentTableNode
      ),
      nodeLinks: [...referenceNodeLinks, ...relationshipNodeLinks],
    };
  }
}

module.exports = EnhancedRecordConfigService;
