var NowAssistsSkillsDao = Class.create();
NowAssistsSkillsDao.prototype = {
    initialize: function() {
        this._tableName = 'now_assists_skills';
    },

    insertSkillsData: function(skillsData, lookback, accrualTime) {
        const gr = new GlideRecord(this._tableName);
        if (lookback === 365 && skillsData.length === 0) { //no skills data was found for 365 lookback
            //create a generic skills record with empty feature and assist count of 0
            gr.initialize();
            gr.setValue(LicensingEngineDBConstants.LOOKBACK, lookback);
            gr.setValue(LicensingEngineDBConstants.ACCRUAL_TIME, accrualTime.getValue());
            gr.setValue('used_assists', 0);
            gr.insert();
        }

        skillsData.forEach(function(data) {
            gr.initialize();
            gr.setValue(LicensingEngineDBConstants.LOOKBACK, lookback);
            gr.setValue('feature', data.group);
            gr.setValue(LicensingEngineDBConstants.ACCRUAL_TIME, accrualTime.getValue());
            gr.setValue('used_assists', Number(data.totalAssists)); // Convert string to number
            gr.insert();
        });
    },

    /**
     * Retrieves the feature IDs and their aggregated number of actions from the most recent
     * calculations.
     *
     * @returns {array} An array of objects comforming to { featureId: '', totalAssists: 0 }
     */
    getFeatureIdAndTotalAssists: function() {
        const lookback = '365';

        const timestamp = this._getMostRecentSysCreatedOnForDefinitionId(lookback);

        const gr = new GlideRecord(this._tableName);
        gr.addQuery(LicensingEngineDBConstants.LOOKBACK, lookback);
        gr.addQuery(LicensingEngineDBConstants.ACCRUAL_TIME, timestamp);
        gr.orderByDesc(LicensingEngineDBConstants.ACCRUAL_TIME);
        gr.query();

        // For each 'feature' value, we only want the most recent record.
        const records = new Map();
        while (gr.next()) {
            const key = gr.getValue('feature');
            const record = {
                accrualTime: gr.getValue(LicensingEngineDBConstants.ACCRUAL_TIME),
                featureId: key,
                totalAssists: parseInt(gr.getValue(LicensingEngineDBConstants.USED_ASSISTS)),
            };
            if (!records.has(key) || records.get(key).accrualTime < record.accrualTime)
                records.set(key, record);
        }

        return [...records]
            .map(([name, value]) => (value));
    },

    /**
     * Retrieves the most recent accrual time GlideDateTime value for a given lookback
     *
     * @param {string} lookback The lookback period we are finding the max accrual time for
     * @returns {GlideDateTime} The max time located or null if no value was found.
     */
    _getMostRecentSysCreatedOnForDefinitionId: function(lookback) {
        const gr = new GlideRecord(this._tableName);
        gr.addQuery('lookback', lookback);
        gr.orderByDesc(LicensingEngineDBConstants.ACCRUAL_TIME);
        gr.setLimit(1);
        gr.query();

        return gr.next() ? new GlideDateTime(gr.getValue(LicensingEngineDBConstants.ACCRUAL_TIME)) : null;
    },

    type: 'NowAssistsSkillsDao'
};
