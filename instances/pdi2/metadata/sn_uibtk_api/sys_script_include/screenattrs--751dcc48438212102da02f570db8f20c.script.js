const ScreenAttrs = Class.create();
ScreenAttrs.prototype = Object.extendsObject(BuilderToolkitAPIBase, {
    TABLE: 'sys_ux_screen_attrs',
    FIELDS: ['advanced_performance_settings', 'screen'],
    FIELD_TYPES: {
        advanced_performance_settings: 'json',
        screen: 'reference'
    },

    /**
     * @param fields {string[]}
     */
    initialize: function(fields) {
        BuilderToolkitAPIBase.prototype.initialize.call(this, this.TABLE, fields || this.FIELDS, undefined, undefined, this.FIELD_TYPES);
    },

    /**
     * @param screenId {string} the ID of screen for which we are fetching attributes
     */
    getRecordByScreenId: function(screenId) {
        try {
            const recordGR = this.getRecordsByQuery('screen=' + screenId, '', true);
            if (recordGR && recordGR.next()) {
                return this.getValuesFromGlideRecord(recordGR);
            }
        } catch (err) {
            gs.error(err);
        }
        return null;
    },

    /**
     * @param screenID {string} Sys Id of the screen for which attributes are being created
     * @param fields {object} payload containing advanced performance settings config
     */
    createScreenAttrsForScreenId: function(fields) {
        const advancedPerformanceSettings = fields?.advancedPerformanceSettings;
        const screenId = fields?.screen;
        const encodedQuery = 'screen=' + screenId;

        try {
            let screenAttrsGR = this.getRecordsByQuery(encodedQuery, '', true);

            if (advancedPerformanceSettings) {
                let recordUpdated;
                const fieldsToBeUpdated = {
                    advanced_performance_settings: advancedPerformanceSettings
                };

                if (screenAttrsGR && screenAttrsGR.next()) {
                    const sysId = fields?.sysId ? fields.sysId : screenAttrsGR.getValue('sys_id');
                    recordUpdated = this.updateRecord({
                        sysId,
                        ...fieldsToBeUpdated
                    });
                }

                if (!recordUpdated) {
                    fieldsToBeUpdated.screen = screenId;
                    recordUpdated = this.createRecord(fieldsToBeUpdated, encodedQuery);
                }

                return !!recordUpdated;
            }
        } catch (err) {
            gs.error(err);
        }
        return null;
    },

    type: 'ScreenAttrs'
});
