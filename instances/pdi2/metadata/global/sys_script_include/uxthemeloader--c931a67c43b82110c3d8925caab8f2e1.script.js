var UXThemeLoader = Class.create();
UXThemeLoader.prototype = {
    initialize: function() {},

    fetchTheme: function() {
        var MAKO_THEME_SYS_ID = '26feff95479d2910d0a3d4fe536d430c';
        var themeLoaderResponse = {};
        try {
            themeLoaderResponse['status'] = "Success";

            var variantSysId = gs.getUser().getPreference('glide.ui.udc.theme.variant') || '';
            var themeResponse = {};
            if (variantSysId !== '') {
                themeResponse = JSON.parse(UxPageThemeUtil.getThemeByThemeIdVariantId(MAKO_THEME_SYS_ID, variantSysId));
                // if no variant, default to light theme
            } else {
                themeResponse = JSON.parse(UxPageThemeUtil.getUXPageThemeByThemeId(MAKO_THEME_SYS_ID));
            }

            if (themeResponse.error) {
                themeLoaderResponse['status'] = "Error";
                themeLoaderResponse['error'] = themeResponse.error + " for theme sys_id " + MAKO_THEME_SYS_ID + " and variant sys_id " + variantSysId;
                gs.log('Flow Designer Error : ' + themeResponse.error + " for theme sys_id " + MAKO_THEME_SYS_ID + " and variant sys_id " + variantSysId);
                return themeLoaderResponse;
            }

            var themeJSON = themeResponse.theme;

            // convert theme JSON to CSS map
            var toCSSString = Object.keys(themeJSON).map(function(propertyName) {
                return propertyName + ': ' + themeJSON[propertyName] + ';';
            }).join('');
            themeLoaderResponse['theme'] = toCSSString;

            return themeLoaderResponse;

        } catch (e) {
            themeLoaderResponse['status'] = "Error";
            themeLoaderResponse['error'] = "Flow Designer : Exception fetching theme for theme sys_id " + MAKO_THEME_SYS_ID + " and variant sys_id " + variantSysId + " : " + e;
            gs.log("Flow Designer : Exception fetching theme for theme sys_id " + MAKO_THEME_SYS_ID + " and variant sys_id " + variantSysId + " : " + e);
            return themeLoaderResponse;
        }
    },
    type: 'UXThemeLoader'

};
