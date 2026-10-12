var DISHVersion = Class.create();
DISHVersion.prototype = {
    initialize: function() {},

    setVersion: function() {
        this._checkDCSupportsTLS();
    },

    _checkDCSupportsTLS: function() {
        try {
            // DISH is not supported for on prem customers, skip the check
            if (GlideUtil.isSelfHostedInstance()) return false;
            var pingUrl = GlidePropertiesDB.get('glide.services.status.ping_url');
            var domain = pingUrl.match(/^https?:\/\/[^\/]+/)[0];
            var endpoint = domain + '/adcv2/supports_tls';
            var client = new GlideHTTPClient();
            client.setFollowRedirect(false);
            client.setHttpTimeout(30 * 1000);
            var request = new Packages.org.apache.commons.httpclient.methods.GetMethod(endpoint);
            var result = client.executeMethod(request);
            if (result === 200) {
                GlidePropertiesDB.set('glide.services.dish_v2', request.getResponseBodyAsString());
            } else {
                sn_log.GlideLogger.atError().log('checkDCSupportsTLS: response code is ' + result);
                GlidePropertiesDB.set('glide.services.dish_v2', false);
            }
        } catch (error) {
            gs.setProperty('glide.services.dish_v2', false);
            sn_log.GlideLogger.atError().log('checkDCSupportsTLS: ' + error.message);
        }
    },

    type: 'DISHVersion'
};
