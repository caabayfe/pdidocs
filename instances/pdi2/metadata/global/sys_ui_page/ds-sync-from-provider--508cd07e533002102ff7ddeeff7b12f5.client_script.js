$j("#spinContainer").css("display", "none");

function onSyncNow() {
    var documentSysID = gel('documentSysID').value;
    var ajaxHelper = new GlideAjax('DocumentExternalProviderUIUtils');
    ajaxHelper.addParam('sysparm_name', 'syncFromProvider');
    ajaxHelper.addParam('sysparm_documentSysID', documentSysID);
    ajaxHelper.getXMLAnswer(syncFromProvider);
    $j("#spinContainer").css("display", "flex");
    $j("#providerContainer").css("display", "none");
    $j("#ok_button").attr("disabled", true);
    $j("#cancel_button").attr("disabled", true);
    $j("#ds_sync_from_provider_closemodal").attr("disabled", true);
}

function syncFromProvider(answer) {
    g_form.clearMessages();
    var output = JSON.parse(answer);
    var status = output.status;
    var errorMsg = output.error_message;
    var versionCreated = output.newVersionCreated;
    if (status.toLowerCase() != "success") {
        g_form.addErrorMessage(errorMsg);
    } else {
        if (versionCreated)
            g_form.addInfoMessage(getMessage("A new version with the latest changes from the external cloud has been created."));
        else
            g_form.addInfoMessage(getMessage("Download skipped, latest version already exists."));
    }
    refreshVersions("ds_document.ds_document_version.document");
    GlideModal.prototype.get('ds_sync_from_provider').destroy();
}

function refreshVersions(listId) {
    var list = typeof globalThis.GlideList2 !== "undefined" ? globalThis.GlideList2.getByName(listId) : null;
    if (list != null)
        list.refresh();
}

// For keyboard accessibility
gel('ds_sync_from_provider').addEventListener("keydown", function(event) {
    if (event.key == "Tab" && event.shiftKey && document.activeElement === gel("ds_sync_from_provider_closemodal"))
        gel("tab-helper").focus();
});
gel('ds_sync_from_provider').addEventListener("keyup", function(event) {
    if (event.key == "Tab" && event.target === gel("tab-helper"))
        gel("ds_sync_from_provider_closemodal").focus();
});
