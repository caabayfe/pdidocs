var FeatureFlagDao = Class.create();
FeatureFlagDao.prototype = {
    initialize: function() {
        this.TABLE_NAME = "sn_experiment_core_feature_flag";
    },

    getFeatureFlagBySysId: function(sysId) {
        if (!sysId) {
            gs.warn("FeatureFlagDao.getFeatureFlagBySysId: sysId is required");
            return null;
        }

        var gr = new GlideRecord(this.TABLE_NAME);
        if (gr.get(sysId)) {
            return new FeatureFlag().initializeWithGr(gr);
        }
        return null;
    },

    getFeatureFlagByKey: function(key) {
        if (!key) {
            gs.warn("FeatureFlagDao.getFeatureFlagByKey: key is required");
            return null;
        }

        var gr = new GlideRecord(this.TABLE_NAME);
        gr.addQuery("key", key);
        gr.query();

        if (gr.next()) {
            return new FeatureFlagDao().initializeWithGr(gr);
        }
        return null;
    },

    saveFeatureFlag: function(featureFlag) {
        if (!featureFlag || typeof featureFlag !== "object") {
            gs.error("FeatureFlagDao.saveFeatureFlag: Valid FeatureFlag object is required");
            return null;
        }

        try {
            var gr = new GlideRecord(this.TABLE_NAME);
            var sysId = featureFlag.getSysId();
            var isUpdate = gr.get(sysId);

            if (!isUpdate) {
                gr.initialize();
                if (sysId) gr.setNewGuidValue(sysId);
            }

            gr.setValue("name", featureFlag.getName());
            gr.setValue("description", featureFlag.getDescription());
            gr.setValue("key", featureFlag.getKey());
            gr.setValue("type", featureFlag.getType());
            gr.setValue("overview", featureFlag.getOverview());
            gr.setValue("capabilities", featureFlag.getCapabilities());
            gr.setValue("app_scope", featureFlag.getAppScope());
            gr.setValue("app_min_version", featureFlag.getAppMinVersion());

            var savedSysId = gr.update();
            return savedSysId || gr.getUniqueValue();
        } catch (error) {
            gs.error("FeatureFlagDao.saveFeatureFlag: " + error.message);
            return null;
        }
    },

    type: "FeatureFlagDao",
};
