/**
 * Owner: App-CMDB-IRE
 *
 * One helper, one swap point for RIO Experimentation Framework (sn_experiment_core)
 * feature-flag reads in this scope. Keeps raw sn_experiment_core calls out of
 * business logic and stable if the API surface evolves.
 */
var CMDBFeatureFlags = Class.create();
CMDBFeatureFlags.prototype = {

    initialize: function() {
        this._api = new sn_experiment_core.ExperimentationAPI();
    },

    /**
     * Returns true when the experiment resolves to the "true" variant.
     * @param {String} experimentKey - RIO experiment key.
	 * @param {String} fallback - 'false' OR 'true'
     * @return {Boolean}
     */
    isEnabled: function(experimentKey, fallback) {
        return this._getVariant(experimentKey, fallback) === 'true';
    },

    _getVariant: function(experimentKey, fallback) {
        try {
            var request = new sn_experiment_core.ExperimentRequest()
                .setExperimentKey(experimentKey)
                .setFallbackVariantValue(fallback);

			return this._api.getContext(request).getVariant();
        } catch (e) {
            gs.error('[app-cmdb] CMDBFeatureFlags read failed for ' + experimentKey + ': ' + e.message);
            return fallback;
        }
    },

    type: 'CMDBFeatureFlags'
};
