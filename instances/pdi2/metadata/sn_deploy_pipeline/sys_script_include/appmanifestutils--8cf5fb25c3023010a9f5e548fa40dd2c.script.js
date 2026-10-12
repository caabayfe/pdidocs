var AppManifestUtils = Class.create();
AppManifestUtils.prototype = {
    initialize: function(appManifestData) {
        this.appManifestData = appManifestData;
    },

    type: 'AppManifestUtils',

    getTransformedAppManifest: function() {
        var transformedManifestData = {};

        this.appManifestData.forEach(function(data) {
            var field = data.groupby_fields[0];
            var displayName = field.display_value;

            transformedManifestData[displayName] = data.stats.count;
        });

        return transformedManifestData;
    },

    getStringifiedAppManifest: function() {
        var transformedAppManifest = this.getTransformedAppManifest();
        var appManifestKeys = Object.keys(transformedAppManifest);
        var sortedAppManifestKeys = appManifestKeys.sort();
        var sortedAppManifest = sortedAppManifestKeys.reduce(function(obj, key) {
            obj[key] = transformedAppManifest[key];

            return obj;
        }, {});

        return JSON.stringify(sortedAppManifest, null, 1);
    },

};
