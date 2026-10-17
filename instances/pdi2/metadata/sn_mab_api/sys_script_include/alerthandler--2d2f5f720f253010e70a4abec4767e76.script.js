class AlertHandler {
  constructor() {}

  generateMissingM2MChildAlert(parentTable, parentSysId, childTable) {
    const alertType = 'missingM2MChild';
    const alertData = {
      parentTable,
      parentSysId,
      childTable,
    };

    return {
      type: alertType,
      alertData,
    };
  }

  generateUnretrievableNodeAlert(tableName, sysId) {
    const alertType = 'unretrievableNode';
    const alertData = {
      table: tableName,
      sysId,
    };

    return {
      type: alertType,
      alertData,
    };
  }
}

module.exports = AlertHandler;
