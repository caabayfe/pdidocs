(function executeRule(current, previous /*null when async*/ ) {
    var constants = new sn_vsc.SecurityCenterConstants();
    var taskParams = {};
    //generate banner link and include it in details params
    var url = current.getValue('link');
    var link_type = current.getValue('link_type');
    var bannerLinkUrl;
    if (!link_type || url.startsWith("http:") || url.startsWith("https:"))
        bannerLinkUrl = url;
    else if (link_type == 'support_portal_link')
        bannerLinkUrl = gs.getProperty("glide.management.host", "https://support.servicenow.com/") + url;
    taskParams.details_params = [current.getValue('description'), bannerLinkUrl];
    new sn_vsc.SCTaskManagerOperations().queueSecurityTaskCreate(constants.securityTaskType.NEW_BANNER_ANNOUNCEMENT, current, taskParams);
})(current, previous);
