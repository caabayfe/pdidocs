var StreamConnectTopicValidator = Class.create();

//Table names
StreamConnectTopicValidator.HERMES_TOPIC_TABLE = 'sys_kafka_topic_m2m_sys_sc_topic_alias';
StreamConnectTopicValidator.EXTERNAL_TOPIC_TABLE = 'sys_kafka_direct_topic';
StreamConnectTopicValidator.SC_TOPIC_TABLE = 'sys_sc_topic_alias';

//Field names
StreamConnectTopicValidator.SC_TOPIC_FIELD = 'sc_topic_alias';
StreamConnectTopicValidator.HERMES_TOPIC_FIELD = 'hermes_topic';

StreamConnectTopicValidator.prototype = {
    initialize: function() {},

    /**
     * Check if a Topic Alias is connected to any underlying Kafka topic
     * @param {String} topicAliasId - The sys_id of the Topic Alias
     * @return {Boolean} - True if connected to either Hermes or Direct Kafka topic
     */
    isTopicAliasConnected: function(topicAliasId) {
        if (!topicAliasId) {
            return false;
        }

        if (this._recordExistsWithFieldValue(
            StreamConnectTopicValidator.HERMES_TOPIC_TABLE,
            StreamConnectTopicValidator.SC_TOPIC_FIELD,
            topicAliasId,
            null
        )) {
            return true;
        }

        return this._recordExistsWithFieldValue(
            StreamConnectTopicValidator.EXTERNAL_TOPIC_TABLE,
            StreamConnectTopicValidator.SC_TOPIC_FIELD,
            topicAliasId,
            null
        );
    },

    /**
     * Generic field value uniqueness/existence validator
     * @param {GlideRecord} current - The current record
     * @param {Object} rule - Rule definition with params and errorMessage
     * 
     * Required params:
     * - fieldValue: The value to check
     * - tableName: The table to check in
     * - fieldName: The field name to check
     * - excludeCurrent: Boolean to indicate if current record should be excluded (default: true)
     */
    validateFieldValueUniqueness: function(current, rule) {
        var params = rule.params;
        var fieldValue = params.fieldValue;
        var tableName = params.tableName;
        var fieldName = params.fieldName;
        var excludeCurrent = (typeof params.excludeCurrent !== 'undefined') ? params.excludeCurrent : true;

        if (!fieldValue)
            return true;

        var recordToExclude = excludeCurrent ? current : null;

        if (this._recordExistsWithFieldValue(tableName, fieldName, fieldValue, recordToExclude)) {
            gs.addErrorMessage(rule.message);
            current.setAbortAction(true);
            return false;
        }

        return true;
    },

    /**
     * Validate if a Topic has any associations with specified tables
     * @param {GlideRecord} current - The current record being processed
     * @param {Object} rule - Rule definition with params and message
     * @return {Boolean} - Always returns true as this is an informational validation
     */
    validateTopicAssociations: function(current, rule) {
        var params = rule.params;
        var fieldValue = params.fieldValue;
        var tableNames = params.tableNames || [];
        var fieldName = params.fieldName;

        for (var i = 0; i < tableNames.length; i++) {
            if (this._recordExistsWithFieldValue(tableNames[i], fieldName, fieldValue, null)) {
                return true;
            }
        }

        gs.addInfoMessage(rule.message);
        return true;
    },

    /**
     * Helper method to check if a record with a specific field value exists
     * @param {String} tableName - Table to query
     * @param {String} fieldName - Field to check
     * @param {String} fieldValue - Value to look for
     * @param {GlideRecord} current - Current record (to exclude from results)
     * @return {Boolean} - True if matching record exists, false otherwise
     */
    _recordExistsWithFieldValue: function(tableName, fieldName, fieldValue, current) {

        if (!this._tableExists(tableName)) {
            return false;
        }
        var checkGr = new GlideRecord(tableName);
        checkGr.addQuery(fieldName, fieldValue);

        // For existing records, exclude the current record from the check
        if (current && current.getUniqueValue())
            checkGr.addQuery('sys_id', '!=', current.getUniqueValue());

        checkGr.setLimit(1);
        checkGr.query();
        return checkGr.hasNext();
    },

    _tableExists: function(tableName) {
        var gr = new GlideRecord(tableName);
        return gr.isValid();
    },

    type: 'StreamConnectTopicValidator'
};
