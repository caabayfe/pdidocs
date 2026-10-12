var ExperimentationPropertyManager = Class.create();
ExperimentationPropertyManager.prototype = {
    initialize: function () {},

    /**
     * Updates the experimentation.framework.disabled property
     * @param {Boolean} disable - true = disable experimentation, false = enable experimentation
     */
    setExperimentationDisabled: function (disable) {
        try {
            var prop = new GlideRecord('sys_properties');
            if (!prop.get('name', 'experimentation.framework.disabled')) {
                prop.initialize();
                prop.name = 'experimentation.framework.disabled';
                prop.ignore_cache = true;
            }
            prop.value = disable ? 'true' : 'false';
            prop.update();

            gs.info('[ExperimentationPropertyManager] experimentation.framework.disabled set to ' + prop.value);
            return "success";
        } catch (e) {
            gs.error('[ExperimentationPropertyManager] Error updating experimentation flag: ' + e.message);
            return "error";
        }
    },

    /**
     * Updates the experimentation.featureflag.disabled property
     * @param {Boolean} disable - true = disable feature flags, false = enable feature flags
     */
    setFeatureFlagsDisabled: function (disable) {
        try {
            var prop = new GlideRecord('sys_properties');
            if (!prop.get('name', 'experimentation.featureflag.disabled')) {
                prop.initialize();
                prop.name = 'experimentation.featureflag.disabled';
                prop.ignore_cache = true;
            }
            prop.value = disable ? 'true' : 'false';
            prop.update();

            gs.info('[ExperimentationPropertyManager] experimentation.featureflag.disabled set to ' + prop.value);
            return "success";
        } catch (e) {
            gs.error('[ExperimentationPropertyManager] Error updating feature flags flag: ' + e.message);
            return "error";
        }
    },

    type: 'ExperimentationPropertyManager'
};
