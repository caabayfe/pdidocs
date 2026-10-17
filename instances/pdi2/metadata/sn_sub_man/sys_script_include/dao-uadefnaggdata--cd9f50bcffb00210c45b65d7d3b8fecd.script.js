var dao_UaDefnAggData = Class.create();
dao_UaDefnAggData.prototype = {
    initialize: function() {
        this._tableName = 'ua_defn_agg_data';
    },

    /**
     * Retrieves the feature IDs and their aggregated number of actions from the most recent
     * definition calculations.
     * 
     * @returns {array} An array of objects comforming to { featureId: '', totalAssists: 0 }
     */
    getFeatureIdAndTotalAssists: function() {
        const definitionId = 'DEFN2006407';

        const lookBackTimeStamp = this._getMostRecentSysCreatedOnForDefinitionId(definitionId);
        if (!lookBackTimeStamp)
            return [];
        lookBackTimeStamp.addDaysUTC(-2); // Looking back 2 days to be conservative and avoid any date boundary, timezone, or run-delay issues.

        const gr = new GlideRecord(this._tableName);
        gr.addQuery('definition_id', definitionId);
        gr.addQuery('sys_created_on', '>=', lookBackTimeStamp);
        gr.orderByDesc('sys_created_on');
        gr.query();

        // For each 'group1' value, we only want the most recent record.
        const records = new Map();
        while (gr.next()) {
            const key = gr.getValue('group1');
            const record = {
                sysCreatedOn: gr.getValue('sys_created_on'),
                featureId: gr.getValue('group1'),
                totalAssists: parseInt(gr.getValue('agg_val')),
            };
            if (!records.has(key) || records.get(key).sysCreatedOn < record.sysCreatedOn)
                records.set(key, record);
        }

        return [...records]
            .map(([name, value]) => (value));
    },

    /**
     * Retrieves the most recent sys_created_on GlideDateTime value for a definition
     * 
     * @param {string} definitionId The definition ID we are finding the max sys_created_on date for
     * @returns {GlideDateTime} The max time located or null if no value was found.
     */
    _getMostRecentSysCreatedOnForDefinitionId: function(definitionId) {
        const gr = new GlideRecord(this._tableName);
        gr.addQuery('definition_id', definitionId);
        gr.orderByDesc('sys_created_on');
        gr.setLimit(1);
        gr.query();

        return gr.next() ? new GlideDateTime(gr.getValue('sys_created_on')) : null;
    },

    type: 'dao_UaDefnAggData'
};
