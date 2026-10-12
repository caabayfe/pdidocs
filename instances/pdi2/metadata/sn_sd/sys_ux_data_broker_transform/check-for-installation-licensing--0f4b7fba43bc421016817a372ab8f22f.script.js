function transform(input) {
    var response = {};
    for (var i = 0; i < input.appsInfo.length; i++) {
        response[input.appsInfo[i].appId] = {};
        response[input.appsInfo[i].appId]['licensingStatus'] = true;
        response[input.appsInfo[i].appId]['installationStatus'] = false;
        if (input.appsInfo[i].installationCheck)
            response[input.appsInfo[i].appId]['installationStatus'] = GlidePluginManager.isActive(input.appsInfo[i].appId);
        else if (input.appsInfo[i].licenseCheck) {
            try {
                if (GlidePluginManager.isActive('com.sn_licensing_engine'))
                    response[input.appsInfo[i].appId]['licensingStatus'] = new sn_entitlement.GlideEntitlementAPI().hasLicenseForArtifact("app_id", input.appsInfo[i].appId);
            } catch (e) {
                gs.addErrorMessage(gs.getMessage('The required entitlement is not available'));
            }
        }
    }
    return response;
}
