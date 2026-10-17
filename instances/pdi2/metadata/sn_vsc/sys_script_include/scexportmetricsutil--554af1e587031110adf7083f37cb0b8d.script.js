var SCExportMetricsUtil = Class.create();
SCExportMetricsUtil.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    constants: new sn_vsc.SecurityCenterConstants(),
    /**
     * This function will filter the export metrics by the date specified and classification
     * @return {string} - comma separated sys_id values of records from sn_vsc_export_event
     */
    getUserExportTrends: function() {
        var userId = gs.getUserID();
        // Fetch user export setting
        var exportSetting = this._getUserExportSetting(userId);  
        // Build query
        if (exportSetting) {
            var classifications = exportSetting.classification_metric.toString().split(",");
            // Build encoded query
            var query = '';
            // If there are no classifications selected, show all data without classifications
            if (classifications != null && classifications[0] === '') {
                query = 'classificationISEMPTY';
            } else {
                for (var i = 0; i < classifications.length; i++) {
                    classifications[i] = 'classificationLIKE' + classifications[i];
                }
                query = classifications.join('^OR');
            }

            // Fetch all records under this date and classification setting to display on report
            return this._getExportRecords(query);
        } else {
            return '';
        }
    },
    
    /**
     * This function will fetch the export setting record for the user
     * @param {string} userId - sys_id of current userSC
     * @return {GlideRecord} - the user export setting GlideRecord
     */
    _getUserExportSetting: function(userId) {
        var userExpSettingGr = new GlideRecord(this.constants.prototype.SC_EXPORT_SETTING);
        userExpSettingGr.addQuery('user', userId);
        userExpSettingGr.query();
        
        return userExpSettingGr.next() ? userExpSettingGr : '';
    },

    /**
     * This function will fetch the export records from the export events table
     * @param {string} encodedQuery - encoded query for export table
     */
    _getExportRecords: function(encodedQuery) {
        var records = [];
        var exportGr = new GlideRecord(this.constants.prototype.SC_EXPORT);
        exportGr.addEncodedQuery(encodedQuery);
        exportGr.query();
        while (exportGr.next()) {
            records.push(exportGr.sys_id.toString());
        }

        return records;
    },

    type: 'SCExportMetricsUtil'
});
