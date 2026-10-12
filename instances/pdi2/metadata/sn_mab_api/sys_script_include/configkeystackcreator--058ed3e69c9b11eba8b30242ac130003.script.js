class ConfigKeyStackCreator {
  constructor() {
    this.configKeyFactory = new sn_mab_api.ConfigKeyFactory();
    this.validationHandler = new sn_mab_api.ValidationHandler();
    this.errorHandler = new sn_mab_api.ErrorHandler();
  }

  createStackFromNodes(branchNodeArray) {
    if (!branchNodeArray || !branchNodeArray.length) {
      this.errorHandler.throwInternalError('Branch nodes must be provided');
    }

    var configKeyStack = [];
    branchNodeArray.forEach(function (node) {
      var stackEntry = this.createConfigKeyStackEntry(node);
      configKeyStack.push(stackEntry);
    }, this);

    return configKeyStack;
  }

  createConfigKeyStackEntry(node) {
    var currTableName = node.sys_class_name;
    this.validateExternalNodeTable(
      currTableName,
      'External node with missing or non-existing table name: ' + currTableName
    );
    var currSysId = node.sys_id;
    this.validateExternalSysId(
      currSysId,
      'External node with missing or non-existing SysId: ' + currSysId
    );
    var gr = this.createCurrentRecordGR(currTableName, currSysId);
    var generator = this.configKeyFactory.getGenerator(currTableName);
    var configMetadata = generator.getTreeConfiguration(gr, node);
    return new ConfigKeyStackEntry(
      configMetadata.getConfigKey(),
      currTableName,
      currSysId
    );
  }

  validateExternalNodeTable(tableName, err) {
    if (!tableName) this.errorHandler.throwBadRequestError(err);

    if (!this.validationHandler.isValidTable(tableName))
      this.errorHandler.throwNotFoundError(err);
  }

  validateExternalSysId(sysId, err) {
    if (!this.validationHandler.isGeneratedOrNormalSysId(sysId))
      this.errorHandler.throwBadRequestError(err);
  }

  createCurrentRecordGR(tableName, sysId) {
    var gr = new GlideRecord(tableName);
    if (this.isFakeId(sysId)) gr.initialize();
    else if (!gr.get(sysId))
      this.errorHandler.throwBadRequestError(
        'No record found for table: ' + tableName + ' sysId: ' + sysId
      );

    return gr;
  }

  isFakeId(sysId) {
    return this.validationHandler.isGeneratedId(sysId);
  }
}

module.exports = ConfigKeyStackCreator;
