var AIUXExperienceBuilder = Class.create();
AIUXExperienceBuilder.prototype = {
    initialize: function() {},
    // AIUX experience metadata for mobile app
    getExperienceMetadata: function(experienceId) {
        if (!experienceId) {
            return null;
        }
        var experienceGR = new GlideRecord("sys_aix_experience");
        if (!experienceGR.get(experienceId)) {
            return null;
        }
        var urlSuffix = experienceGR.getValue('url_suffix');
        var baseUrl = 'aiux/' + urlSuffix + '/home';

        var themeGR = experienceGR.theme.getRefRecord();
        var lightLogoUrl = "";
        var darkLogoUrl = "";

        if (themeGR.isValidRecord()) {
            lightLogoUrl = this._resolveImageUrl(themeGR.getValue('light_logo'));
            darkLogoUrl = this._resolveImageUrl(themeGR.getValue('dark_logo'));
        }

        var result = {
            Name: experienceGR.getValue('sys_name'),
            Url: baseUrl,
            Label: experienceGR.getValue('title'),
            LightLogoUrl: lightLogoUrl,
            DarkLogoUrl: darkLogoUrl
        };
        return result;
    },

    /**
     * Takes a sys_id from db_image and returns the path /filename.extension
     */
    _resolveImageUrl: function(imageSysId) {
        if (!imageSysId) return "";

        var imgGR = new GlideRecord('db_image');
        if (imgGR.get(imageSysId)) {
            return "/" + imgGR.getValue('name');
        }
        return "";
    },

    type: 'AIUXExperienceBuilder'
};
