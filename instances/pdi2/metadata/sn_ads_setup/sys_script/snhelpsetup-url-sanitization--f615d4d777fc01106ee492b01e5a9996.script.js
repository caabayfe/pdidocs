(function executeRule(current, previous /*null when async*/ ) {

    var url = GlideSecurityUtils.cleanURL(current.url);
    var helpUtil = new SNHelpSetupUtil();
    if (current.configuration_types.toString() === "iframe" && helpUtil.hasFullURI(url)) {
        if (url.indexOf("/now/") > 0)
            url = "/now/" + url.split("/now/")[1];
        else
            url = "%2F" + GlideSecurityUtils.enforceRelativeURL(url);
    }
    current.url = url;

})(current, previous);
