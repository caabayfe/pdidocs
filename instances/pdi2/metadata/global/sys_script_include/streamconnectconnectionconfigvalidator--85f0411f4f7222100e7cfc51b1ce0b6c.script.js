var StreamConnectConnectionConfigValidator = Class.create();

StreamConnectConnectionConfigValidator.KAFKA_CONNECTION_TABLE = 'kafka_connection';
StreamConnectConnectionConfigValidator.MESSAGE_REPLICATION_TABLE = 'sys_sc_message_replication';
StreamConnectConnectionConfigValidator.DIRECT_KAFKA_TABLE = 'sys_kafka_direct_cluster';

StreamConnectConnectionConfigValidator.CONNECTION_ALIAS_FIELD = 'connection_alias';
StreamConnectConnectionConfigValidator.EXTERNAL_KAFKA_FIELD = 'external_kafka';

StreamConnectConnectionConfigValidator.prototype = {
  initialize: function() {},

  /**
 * Validate that an alias has exactly one active connection
 * @param {GlideRecord} current - The current record
 * @param {Object} rule - Rule containing params and message
 * @returns {Boolean} Whether the validation passed
 */
  validateActiveConnectionCount: function(current, rule) {
    var params = rule.params;
    var fieldValue = params.fieldValue;
    var fieldName = params.fieldName;
    var tableName = params.tableName;

    if (!fieldValue) {
      return true;
    }

    var connectionGR = this._getActiveConnections(tableName, fieldName, fieldValue);
    if (!connectionGR || connectionGR.getRowCount() !== 1) {
      gs.addErrorMessage(rule.message);
      return false;
    }
    return true;
  },

  /**
 * Validate MID usage for the existing active connection
 * @param {GlideRecord} current - The current record
 * @param {Object} rule - Rule containing params and message
 * @returns {Boolean} Whether the validation passed
 */
  validateConnectionMidUsage: function(current, rule) {
    var params = rule.params;
    var fieldValue = params.fieldValue;
    var fieldName = params.fieldName;
    var tableName = params.tableName;
    var midShouldBeEnabled = !!params.requireMid;

    if (!fieldValue) {
      return true;
    }
    var connectionGR = this._getActiveConnections(tableName, fieldName, fieldValue);
    if (!connectionGR || connectionGR.getRowCount() !== 1) {
      return true;
    }

    connectionGR.next();
    var midIsEnabled = (connectionGR.getValue('use_mid') === '1');
    if (midIsEnabled !== midShouldBeEnabled) {
      gs.addErrorMessage(rule.message);
      return false;
    }

    return true;
  },

  /**
 * Validates that a connection's MID server setting cannot be changed if the connection 
 * is already in use by Direct Kafka Access (requires no MID) 
 * or Message Replication (requires MID).
 * 
 * @param {GlideRecord} current - The current kafka_connection record being updated
 * @param {Object} rule - The validation rule containing parameters and message
 * @returns {Boolean} True if validation passes, false if it fails
 */
  validateConnectionMidUsageChange: function(current, rule) {
    var currentMidValue = rule.params.currentMidValue;
    var requiresMid = rule.params.requiresMid;
    var connectionAlias = rule.params.fieldValue;
    var tableName = rule.params.tableName;
    var fieldName = rule.params.fieldName;

    var record = this._recordExistsWithAlias(tableName, fieldName, connectionAlias);
    if (record) {
      if (requiresMid === currentMidValue) {
        // Current change maintains or corrects the MID setting - allow it
        return true;
      } else {
        // Current change would break the configuration - block it
        current.setAbortAction(true);
        gs.addErrorMessage(rule.message);
        return false;
      }
    }

    return true;
  },

  /**
 * Get active connections for a given field value
 * @param {String} tableName - Table name to query
 * @param {String} fieldName - Field name to query on
 * @param {String} fieldValue - Field value to match
 * @returns {GlideRecord} GlideRecord with active connections
 */
  _getActiveConnections: function(tableName, fieldName, fieldValue) {
    var conditions = {};
    conditions[fieldName] = fieldValue;
    conditions['active'] = true;

    return this._queryRecords(tableName, conditions);
  },

  /**
     * Find a record that uses the specified connection alias
     * @param {String} tableName - Name of the table to search
     * @param {String} fieldName - Name of the field that references the alias
     * @param {String} aliasValue - Value of the connection alias
     * @returns {Object} Object containing record details, or null if not found
     */
  _recordExistsWithAlias: function(tableName, fieldName, fieldValue) {
    var conditions = {};
    conditions[fieldName] = fieldValue;

    var gr = this._queryRecords(tableName, conditions, 1);
    return gr && gr.hasNext();
  },

  /**
 * Generic method to query records with flexible conditions
 * @param {String} tableName - Table to query
 * @param {Object} conditions - Map of field names to values for query conditions
 * @param {Number} limit - Optional result limit
 * @returns {GlideRecord} The query result
 */
  _queryRecords: function(tableName, conditions, limit) {
    if (!this._tableExists(tableName)) {
      return null;
    }

    var gr = new GlideRecord(tableName);
    for (var field in conditions) {
      if (conditions.hasOwnProperty(field)) {
        gr.addQuery(field, conditions[field]);
      }
    }

    if (limit) gr.setLimit(limit);

    gr.query();
    return gr;
  },

  _tableExists: function(tableName) {
    var gr = new GlideRecord(tableName);
    return gr.isValid();
  },

  type: 'StreamConnectConnectionConfigValidator'

};
