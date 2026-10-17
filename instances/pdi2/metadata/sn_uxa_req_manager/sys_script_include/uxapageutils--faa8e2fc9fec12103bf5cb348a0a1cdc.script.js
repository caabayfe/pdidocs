var UXAPageUtils = Class.create();
UXAPageUtils.prototype = {
    initialize: function() {},

    fetchInstancePageNames: function(appSysId, pageNames) {
        return this.fetchPageNames(appSysId, pageNames);
    },

    // Method to fetch page names
    fetchPageNames: function(appSysId, pageNames) {
        var result = {};
        try {
            if (!appSysId) {
                throw new Error(gs.getMessage('AppSysId is required'));
            }

            var gr = new GlideRecord(UXAConstants.TABLE.UXA_APP_SCREEN);
            gr.addQuery(UXAConstants.UXA_SCREEN_DISPLAY_NAMES.APP_SYS_ID, appSysId);


            if (pageNames && pageNames.length > 0) {
                gr.addQuery(UXAConstants.UXA_SCREEN_DISPLAY_NAMES.NAME, 'IN', pageNames.join(','));
            }

            gr.query();
            while (gr.next()) {
                result[gr.getValue(UXAConstants.UXA_SCREEN_DISPLAY_NAMES.NAME)] = gr.getValue(UXAConstants.UXA_SCREEN_DISPLAY_NAMES.DISPLAY_NAME);
            }

            if (Object.keys(result).length === 0) {
                return { status: UXAConstants.NO_RESULTS, message: gs.getMessage('No matching page names found') };
            }

            return result;

        } catch (error) {
            return { status: 'error', message: error.message };
        }
    },

    // Method to update or create a page display name
    updatePageDisplayName: function(appSysId, name, displayName) {
        try {
            // Validate mandatory parameters
            if (!appSysId || !name || !displayName) {
                throw new Error(gs.getMessage('AppSysId, Name, and Display Name are required'));
            }

            var gr = new GlideRecord(UXAConstants.TABLE.UXA_APP_SCREEN);
            gr.addQuery(UXAConstants.UXA_SCREEN_DISPLAY_NAMES.NAME, name);
            gr.addQuery(UXAConstants.UXA_SCREEN_DISPLAY_NAMES.APP_SYS_ID, appSysId);
            gr.query();

            if (gr.next()) {
                // Update existing record
                gr.setValue(UXAConstants.UXA_SCREEN_DISPLAY_NAMES.DISPLAY_NAME, displayName);
                gr.update();
                return { status: 'success', message: gs.getMessage('Page display name updated successfully') };
            } else {
                // Create new record
                gr.initialize();
                gr.setValue(UXAConstants.UXA_SCREEN_DISPLAY_NAMES.NAME, name);
                gr.setValue(UXAConstants.UXA_SCREEN_DISPLAY_NAMES.DISPLAY_NAME, displayName);
                gr.setValue(UXAConstants.UXA_SCREEN_DISPLAY_NAMES.APP_SYS_ID, appSysId);
                gr.insert();
                return { status: 'success', message: gs.getMessage('Page created successfully with default screen type and operating system') };
            }
        } catch (error) {
            return { status: 'error', message: error.message };
        }
    },

    // Method to search page display names by appSysId and searchTerm
    searchPageDisplayName: function(appSysId, searchTerm, operatingSystem) {
        var result = {};
        try {
            // Validate mandatory parameters
            if (!appSysId || !searchTerm) {
                throw new Error(gs.getMessage('AppSysId and Search Term are required'));
            }

            var gr = new GlideRecord(UXAConstants.TABLE.UXA_APP_SCREEN);
            gr.addQuery(UXAConstants.UXA_SCREEN_DISPLAY_NAMES.APP_SYS_ID, appSysId);
            gr.addQuery(UXAConstants.UXA_SCREEN_DISPLAY_NAMES.DISPLAY_NAME, 'STARTSWITH', searchTerm);  // Search for display names starting with searchTerm
            gr.query();

            while (gr.next()) {
                result[gr.getValue(UXAConstants.UXA_SCREEN_DISPLAY_NAMES.NAME)] = gr.getValue(UXAConstants.UXA_SCREEN_DISPLAY_NAMES.DISPLAY_NAME);
            }

            if (Object.keys(result).length === 0) {
                return { status: UXAConstants.NO_RESULTS, message: gs.getMessage('No matching page names found') };
            }

            return result;

        } catch (error) {
            return { status: 'error', message: error.message };
        }
    },

    type: 'UXAPageUtils'
};
