(function executeRule(current, previous) {
    // do the query and creation of the API Key, if required, in the domain of the extension
    // which is the domain of the MID Server.
    var domainSeparation = GlidePluginManager.isActive("com.glide.domain.msp_extensions.installer");
    var domain = current.getValue("sys_domain");
    var apiKeyCredGr = new GlideRecord("mid_webserver_api_key_credentials");
    if (domainSeparation && domain != "global") {
        var domainGr = new GlideRecord("domain");
        // current.getValue("sys_domain_path") still doesn't return the real domain path at this point so let's take it from the actual domain record.
        if (!domainGr.get(domain)) { // should not happen...
            var domainErrMsg = gs.getMessage("Error querying for domain with sys_id == {0}", domain);
            gs.error(domainErrMsg);
            gs.addErrorMessage(domainErrMsg);
            return;
        }
        // each MID is able to access keys from global
        var qc = apiKeyCredGr.addQuery("sys_domain", "global");
        // and from his own domain and any child domains
        qc.addOrCondition("sys_domain_path", "STARTSWITH", domainGr.getValue("sys_domain_path"));
    }
    apiKeyCredGr.queryNoDomain();
    if (!apiKeyCredGr.hasNext()) {
        apiKeyCredGr = new GlideRecord("mid_webserver_api_key_credentials");
        apiKeyCredGr.initialize();
        apiKeyCredGr.setValue("name", domainSeparation ? "mid_webserver_api_key_" + current.getDisplayValue("sys_domain") : "mid_webserver_api_key");
        if (domainSeparation)
            apiKeyCredGr.setValue("sys_domain", domain);
        apiKeyCredGr.insert();
        var errMsg = apiKeyCredGr.getLastErrorMessage();
        if (gs.nil(errMsg))
            gs.addInfoMessage(domainSeparation ? gs.getMessage("<a href='{0}'>MID Web Server API Key</a> created for {1} domain.", [apiKeyCredGr.getLink(), current.getDisplayValue("sys_domain")]) : gs.getMessage("<a href='{0}'>MID Web Server API Key</a> created.", apiKeyCredGr.getLink()));
        else {
            errMsg = domainSeparation ? gs.getMessage("Error creating MID Web Server API Key for {0} domain: {1}", [current.getDisplayValue("sys_domain"), errMsg]) : gs.getMessage("Error creating MID Web Server API Key: {0}", errMsg);
            gs.error(errMsg);
            gs.addErrorMessage(errMsg);
        }
    }
})(current, previous);
