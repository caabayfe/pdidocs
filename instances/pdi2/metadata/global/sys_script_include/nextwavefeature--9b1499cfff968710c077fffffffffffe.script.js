const NextwaveFeature = {

    TABLE_NAME: 'sys_nextwave_feature',

    TABLE_FIELDS: {
        FEATURE_NAME: 'feature_name',
        VALUE: 'value'
    },

    VALUES: {
        TRUE: 'true',
        FALSE: 'false'
    },

    initialize: function() {
    },

    // =========================================================================
    // Record access
    // =========================================================================

    /**
     * @param {String} sysId
     * @returns {GlideRecord|null}
     */
    getRecord: function(sysId) {
        if (gs.nil(sysId)) {
            return null;
        }
        const gr = new GlideRecord(this.TABLE_NAME);
        return gr.get(sysId) ? gr : null;
    },

    /**
     * @param {String} featureName
     * @returns {GlideRecord|null}
     */
    getRecordByName: function(featureName) {
        if (gs.nil(featureName)) {
            return null;
        }
        const gr = new GlideRecord(this.TABLE_NAME);
        gr.addQuery(this.TABLE_FIELDS.FEATURE_NAME, featureName);
        gr.setLimit(1);
        gr.query();
        return gr.next() ? gr : null;
    },

    // =========================================================================
    // Public API - mirrors gs.getProperty / gs.setProperty
    // =========================================================================

    /**
     * Read a feature value. Returns defaultValue when the feature does not exist or has
     * no value set, matching gs.getProperty semantics.
     *
     * @param {String} featureName
     * @param {String} defaultValue Returned when the feature is absent or blank.
     * @returns {String}
     */
    getFeature: function(featureName, defaultValue) {
        const fallback = gs.nil(defaultValue) ? '' : String(defaultValue);
        try {
            const gr = this.getRecordByName(featureName);
            if (!gr) {
                return fallback;
            }
            const value = gr.getValue(this.TABLE_FIELDS.VALUE);
            return gs.nil(value) ? fallback : String(value);
        } catch (err) {
            gs.error('NextwaveFeature.getFeature failed for ' + featureName + ': ' + err);
            return fallback;
        }
    },

    /**
     * Update an existing feature's value. Unlike gs.setProperty this does NOT create the
     * feature when absent - feature records are inserted deliberately, not by script.
     *
     * @param {String} featureName
     * @param {String|Boolean} value
     * @returns {Boolean} True when the value was written. False when the feature does not
     * exist.
     */
    setFeature: function(featureName, value) {
        if (gs.nil(featureName)) {
            return false;
        }
        try {
            const gr = this.getRecordByName(featureName);
            if (!gr) {
                gs.error('NextwaveFeature.setFeature: no such feature, records are created manually: ' + featureName);
                return false;
            }
            gr.setValue(this.TABLE_FIELDS.VALUE, String(value));
            gr.update();
            return true;
        } catch (err) {
            gs.error('NextwaveFeature.setFeature failed for ' + featureName + ': ' + err);
            return false;
        }
    },

    /**
     * Whether a feature is switched on. Fails closed - an absent feature, a blank value,
     * or a read error all report false, so a feature never appears enabled by accident.
     *
     * @param {String} featureName
     * @returns {Boolean}
     */
    isEnabled: function(featureName) {
        return this.getFeature(featureName, this.VALUES.FALSE).toLowerCase() === this.VALUES.TRUE;
    },

    type: 'NextwaveFeature'
};
