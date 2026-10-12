(function(finding) {
    if (GlidePluginManager.isActive('com.glide.tokenbased_auth')) {
        var gr = new GlideRecord('sys_properties');
        // Check for deletion of expired properties
        var targetProperty_authCleanup = 'com.snc.platform.security.token.auth.cleanup';
        var expectedValue_authCleanup = 'true';
        var defaultValue_authCleanup = 'true';
        var propertyValue_authCleanup = gs.getProperty(targetProperty_authCleanup, defaultValue_authCleanup);

        if (propertyValue_authCleanup.toLowerCase() != expectedValue_authCleanup.toLowerCase()) {
            if (gr.get('name', targetProperty_authCleanup)) {
                finding.setCurrentSource(gr);
            }
            finding.increment();
        }

        // Check for default number of days or fewer API Key 
        var targetProperty_apiKey = 'com.snc.platform.security.token.auth.days.expired.api_key.is.kept';
        var defaultValue_apiKey = 7;
        var propertyValue_apiKey = gs.getProperty(targetProperty_apiKey, defaultValue_apiKey);

        if (parseInt(propertyValue_apiKey, 10) > defaultValue_apiKey) {
            if (gr.get('name', targetProperty_apiKey)) {
                finding.setCurrentSource(gr);
            }
            finding.increment();
        }

        // Check for default number of days or fewer HMAC Secret
        var targetProperty_hmacSecret = 'com.snc.platform.security.token.auth.days.expired.hmac_secret.is.kept';
        var defaultValue_hmacSecret = 7;
        var propertyValue_hmacSecret = gs.getProperty(targetProperty_hmacSecret, defaultValue_hmacSecret);

        if (parseInt(propertyValue_hmacSecret, 10) > defaultValue_hmacSecret) {
            if (gr.get('name', targetProperty_hmacSecret)) {
                finding.setCurrentSource(gr);
            }
            finding.increment();
        }
    }
})(finding);
