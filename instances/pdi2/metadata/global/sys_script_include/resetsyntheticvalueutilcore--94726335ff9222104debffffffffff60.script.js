var ResetSyntheticValueUtilCore = Class.create();
ResetSyntheticValueUtilCore.DATA_PATTERN_TABLE = "dp_data_pattern";
ResetSyntheticValueUtilCore.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
    resetToDefault: function() {
        const dataPatternSysId = this.getParameter("sysparm_data_pattern_sys_id");
        return this.resetSyntheticValueForPattern(dataPatternSysId);
    },

    resetSyntheticValueForPattern: function(dataPatternSysId) {
        const response = {};
        var defaultValue;

        try {
            const dataPatternGr = new GlideRecordSecure(ResetSyntheticValueUtilCore.DATA_PATTERN_TABLE);
            dataPatternGr.addQuery("sys_id", dataPatternSysId);
            dataPatternGr.query();
            if (dataPatternGr.next()) {
                defaultValue = DataDiscoveryConstantsCore.DEFAULT_SYNTHETIC_VALUES[dataPatternSysId];
                dataPatternGr.synthetic_value = defaultValue;
                const updateResult = dataPatternGr.update();
                if (!updateResult) throw new Error("GlideRecord update failed.");
            }

            response.defaultSyntheticValue = defaultValue;
            response.message = sn_i18n.Message.getMessage('com.glide.data_privacy_core', "Your synthetic values have been reset.");
            response.isError = false;
        } catch (err) {
            gs.error(err);
            response.message = sn_i18n.Message.getMessage('com.glide.data_privacy_core', "Your synthetic values could not be reset.");
            response.isError = true;
        } finally {
            return JSON.stringify(response);
        }
    },

    type: 'ResetSyntheticValueUtilCore'
});
