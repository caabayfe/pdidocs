(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var appSysId = request.pathParams.app_sys_id;
    var version = request.pathParams.version;
    var publishToStore = false;

    var appGr = new GlideRecord('sys_app');

    appGr.get(appSysId);

    if (!appGr.isValid()) {
        throw new sn_ws_err.ServiceError()
            .setStatus(404)
            .setMessage(gs.getMessage("Invalid app id {0}", appSysId));
    }

    if (!appGr.canRead()) {
        throw new sn_ws_err.ServiceError()
            .setStatus(403)
            .setMessage(gs.getMessage("User does not have permission to read app with id {0}", appSysId));
    }

    var scopedAppVendorInfoObtainer = new sn_appauthor
        .ScopedAppVendorInfoObtainer();
    var validationInfo = scopedAppVendorInfoObtainer
        .obtainDisplayVersionFromAppRepo(appSysId, version, publishToStore);

    var result = {
        isValid: false
    };

    // when there is an on the side of ScopedAppVendorInfoObtainer the validation info is not available. The reason for error can be retrieved using getErrorMessage function
    if (!validationInfo) {
        result.details = gs.getMessage("Error retrieving version validation information. {0}", scopedAppVendorInfoObtainer.getErrorMessage() || "");
    } else if (validationInfo.allowed) {
        result.isValid = true;
    } else {
        var versionExistsMessage = version + " already exists. Please update the version.";

        result.details = validationInfo.errorMessage;

        if (validationInfo.errorMessage === versionExistsMessage) {
            result.isPublishedAppVersionAvailable = true;
        }
    }

    response.setBody(result);
    response.setStatus(200);
})(request, response);
