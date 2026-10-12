/**
 * ListAIRecordActivityDataFetcher - Fetches AI activity data for list records
 * 
 * This script include retrieves information about AI-created records and
 * AI-modified columns from the sys_ai_record_activity table.
 * 
 * @class ListAIRecordActivityDataFetcher
 * @memberof sn_now_list_common
 */
var ListAIRecordActivityDataFetcher = Class.create();

ListAIRecordActivityDataFetcher.prototype = {
    /**
     * Table and field constants
     * @private
     */
    ACTIVITY_TABLE: 'sys_ai_record_activity',
    FIELD_AI_FIELDS: 'fields_updated_by_ai',
    FIELD_UPDATED_BY_AI: 'record_updated_by_ai',
    FIELD_DOCUMENT_TABLE: 'document_table',
    FIELD_DOCUMENT_ID: 'document_id',

    initialize: function() {},

    /**
     * Validates input parameters
     * @private
     * @param {Array} recordIds - Array of record sys_ids
     * @param {string} table - Table name
     * @returns {boolean} True if all parameters are valid
     */
    _isValidInput: function(recordIds, table) {
        if (!recordIds || !Array.isArray(recordIds) || recordIds.length === 0) {
            return false;
        }

        if (!table || typeof table !== 'string') {
            return false;
        }
        return true;
    },

    /**
     * Returns structured AI activity info for given records
     * @public
     * @param {Array} recordIds - Array of record sys_ids to fetch AI data fo
     * @param {string} table - The table name to filter records
     * @returns {Object} Map of record IDs to their AI activity data
     * @example
     * var fetcher = new ListAIRecordActivityDataFetcher();
     * var result = fetcher.get(['sys_id_1', 'sys_id_2'], 'incident');
     * // Returns: { 'sys_id_1': { isAiCreated: true, modifiedColumns: ['short_description'] } }
     */
    get: function(recordIds, table) {
        var self = this;
        var result = {};

        if (!this._isValidInput(recordIds, table)) {
            return result;
        }

        try {
            var gr = new GlideRecord(this.ACTIVITY_TABLE);
            gr.addQuery(this.FIELD_DOCUMENT_ID, 'IN', recordIds);
            gr.addQuery(this.FIELD_DOCUMENT_TABLE, table);
            gr.query();

            while (gr.next()) {
                var documentId = gr.getValue(self.FIELD_DOCUMENT_ID);
                var isAiCreated = global.JSUtil.getBooleanValue(gr, self.FIELD_UPDATED_BY_AI);
                var fields = gr.getValue(self.FIELD_AI_FIELDS) + "";

                var aiModifiedFields = fields.split(',').map(function(fieldName) { return fieldName.trim(); }).filter(Boolean);

                result[documentId] = {
                    isAiCreatedRow: isAiCreated,
                    isAiModifiedRow: aiModifiedFields.length > 0,
                    aiModifiedFields: aiModifiedFields
                };
            }

            return result;
        } catch (exp) {
            gs.error('ListAIRecordActivityDataFetcher.get: Failed to fetch AI activity data - ' + exp.message);
            return result;
        }
    },

    type: 'ListAIRecordActivityDataFetcher'
};
