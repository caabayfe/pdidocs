class AESPluginValidator {

    static getSNSInfo(type, applicationSysId) {
        const resp = {
            isSnsInstalled: false
        };

        if (gs.getProperty('sn_app_eng_studio.show_servicenow_studio_banner', 'false') === 'false') {
            return resp;
        }

        try {
            // check if UDC script available or not 
            // UDC plugin will be available by default , just to make sure adding this check
            if (typeof sn_udc.StudioUtils !== 'undefined') {
                const studioHomePageURL = sn_udc.StudioUtils.getHomePageURL();
                resp.isSnsInstalled = !!studioHomePageURL;
                resp.studioHomePageURL = studioHomePageURL;
                if (type === 'app-details') {
                    const studioAppDetailsPageURL = sn_udc.StudioUtils.getAppDetailsPageURL(applicationSysId);
                    resp.studioAppDetailsPageURL = studioAppDetailsPageURL;
                }
            }
        } catch (e) {
            // throw an error if serviceNow studio plugin is not installed.
            // Throw an error if application sysId is not exist in the instance
            gs.error(e);
            resp.error = e;
            return resp;
        }
        return resp;

    }
}
