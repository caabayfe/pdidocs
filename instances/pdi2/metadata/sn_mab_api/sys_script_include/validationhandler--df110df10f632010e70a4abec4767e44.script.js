class ValidationHandler {
  constructor() {
    this.generatedIdRegex = /new_([0-9a-f]{32})/g;
    this.isOnlyGeneratedIdRegex = /^new_([0-9a-f]{32})$/g;
    this.savedIdRegex = /([0-9a-f]{32})/g;
    this.generatedOrNormalIdRegex = /(new_)?([0-9a-f]{32})/g;
  }

  isValidTable(tableName) {
    try {
      return tableName && gs.tableExists(tableName);
    } catch (exe) {
      return false;
    }
  }

  isTableAccessible(tableName) {
    try {
      return tableName && MobileAppBuilderDAO.isTableAccessible(tableName);
    } catch (exe) {
      return false;
    }
  }

  /**
   *
   * @param value {string}
   * @return {boolean}
   */
  isGeneratedId(value) {
    if (!value || typeof value === 'object') {
      return false;
    }
    var found = value.match(this.isOnlyGeneratedIdRegex);
    return found != null && found.length === 1;
  }

  /**
   *
   * @param value {string}
   * @return {boolean}
   */
  hasGeneratedId(value) {
    if (!value || typeof value === 'object') {
      return false;
    }
    var found = value.match(this.generatedIdRegex);
    return found != null && found.length >= 1;
  }

  /**
   *
   * @param value {string}
   * @return {[]}
   */
  extractGeneratedIds(value) {
    var generatedIds = value.match(this.generatedIdRegex);
    return generatedIds != null && generatedIds.length >= 1 ? generatedIds : [];
  }

  isSavedId(value) {
    if (!value || typeof value === 'object') {
      return false;
    }
    var found = value.match(this.savedIdRegex);
    return found != null && found.length === 1;
  }

  /**
   *
   * @param value {string}
   * @return {boolean}
   */
  isGeneratedOrNormalSysId(value) {
    if (!value || typeof value === 'object') {
      return false;
    }
    var found = value.match(this.generatedOrNormalIdRegex);
    return found != null && found.length === 1;
  }

  isRecordGloballyScoped(tableName, sysId) {
    var gr = new GlideRecord(tableName);

    // check if record exists and is part of global scope
    return gr.get(sysId) && gr.getValue('sys_scope') === 'global';
  }
}

module.exports = ValidationHandler;
