function onLoad() {
    if ((g_form.getValue('publish_status') === "queued" ||
            g_form.getValue('publish_status') === "in_progress") && !g_form.isNewRecord()) {
        var ga = new GlideAjax('getPublishStatus');
        ga.addParam('sysparm_name', 'getStatus');
        ga.addParam('sysparm_sys_id', g_form.getUniqueValue());
        ga.getXMLAnswer(updatePublishStatus);
    }
}

function updatePublishStatus(status) {
    if (status != null && status != undefined)
        g_form.addInfoMessage(getMessageBasedOnStatus(status));
}

function getMessageBasedOnStatus(status) {
    if (status == "queued" || status == "in_progress")
        return formatMessage(
            getMessage("CA certificate request is currently {0}. Please wait till the status changes to active."), status);
    else if (status == "exists")
        return formatMessage(getMessage("CA certificate request is currently {0}."), "active");

    return formatMessage(getMessage("CA certificate request is currently {0}. Please try uploading again later."), status);
}
