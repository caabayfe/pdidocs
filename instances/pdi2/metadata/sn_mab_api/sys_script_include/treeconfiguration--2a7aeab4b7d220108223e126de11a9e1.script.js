class TreeConfigurationNode {
  /**
   * @param gr {GlideRecord}
   */
  constructor(gr) {
    this.relationships = [];
    this.references = [];
    this.configKey = '__EMPTY_CONFIGMETADATA';
    this.compatible = null;
    this.errorHandler = new ErrorHandler();

    // Create empty Configuration Node
    if (!gr) return;

    // Set properties based on GlideRecord values
    this.configKey = gr.getValue('config_key');
    this.compatible = gr.getValue('compatible');

    if (!this.configKey)
      this.errorHandler.throwBadConfigError(
        'Invalid configKey retrieved for TreeConfigurationNode'
      );

    // Create relationships and references if present in GlideRecord
    if (gr.getValue('relationship_config'))
      this.relationships = this._createRelationships(
        this._toObject(gr.getValue('relationship_config'))
      );

    if (gr.getValue('reference_config'))
      this.references = this._createReferences(
        this._toObject(gr.getValue('reference_config'))
      );

    if (gr.getValue('enhanced_record_config'))
      this.enhancedRecordConfig = this._toObject(
        gr.getValue('enhanced_record_config')
      );
  }

  /**
   * Returns the configKey
   * @return {String}
   */
  getConfigKey() {
    return this.configKey;
  }

  /**
   * Returns a map that meets json spec for tree configs
   * @return {*|{TreeConfigurationNode}}
   */
  getFormattedNode() {
    const node = {};

    node[this.configKey] = {
      relationships: this.relationships,
      references: this.references,
    };

    return node;
  }

  /**
   * Create relationship objects from JSON
   * @param relationshipJSON
   * @private
   */
  _createRelationships(relationshipJSON) {
    const relationships = [];
    if (relationshipJSON.length > 0) {
      relationshipJSON.forEach((relationship) => {
        relationships.push(new Relationship(relationship));
      });
    }
    return relationships;
  }

  /**
   * Create reference objects from JSON
   * @param referenceJSON
   * @private
   */
  _createReferences(referenceJSON) {
    const references = [];
    if (referenceJSON.length > 0) {
      referenceJSON.forEach((reference) => {
        references.push(new Reference(reference));
      });
    }
    return references;
  }

  _createEnhancedRecordConfig(enhancedRecordConfigJSON) {
    const enhancedRecordConfig = [];
    if (enhancedRecordConfigJSON.length > 0) {
      enhancedRecordConfigJSON.forEach((config) => {
        enhancedRecordConfig.push(new EnhancedRecordConfig(config));
      });
    }
    return enhancedRecordConfig;
  }

  /**
   * Convert JSON string to object
   * @param json
   * @private
   */
  _toObject(json) {
    try {
      return JSON.parse(json);
    } catch (e) {
      gs.error(
        gs.getMessage(
          'Unable to parse Json from TreeConfigurationNode for configKey: {0}',
          this.configKey
        )
      );
      return null;
    }
  }
}

class Relationship {
  constructor(relationshipJSON) {
    // Validate properties
    if (!relationshipJSON.remoteTableName)
      throw new ErrorHandler().throwBadConfigError(
        'Relationship not defined correctly, no remoteTableName'
      );

    if (!relationshipJSON.remoteRefFieldName)
      throw new ErrorHandler().throwBadConfigError(
        'Relationship not defined correctly, no remoteRefFieldName'
      );

    // Set properties based on JSON values
    this.remoteTableName = relationshipJSON.remoteTableName;
    this.remoteRefFieldName = relationshipJSON.remoteRefFieldName;

    if (relationshipJSON.localRefFieldName)
      this.localRefFieldName = relationshipJSON.localRefFieldName;

    if (relationshipJSON.conditional)
      this.conditional = relationshipJSON.conditional;
  }
}

class Reference {
  constructor(referenceJSON) {
    // Validate properties
    if (!referenceJSON.name)
      throw new ErrorHandler().throwBadConfigError(
        'ReferenceField not defined correctly, no field name'
      );

    // Set properties based on JSON values
    this.name = referenceJSON.name;

    if (referenceJSON.conditional) this.conditional = referenceJSON.conditional;
  }
}

module.exports = TreeConfigurationNode;
