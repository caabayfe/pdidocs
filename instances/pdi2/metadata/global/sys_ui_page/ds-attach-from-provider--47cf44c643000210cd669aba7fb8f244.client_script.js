$j("#googledrive").css("display", "none");
$j("#onedrive").css("display", "none");
$j("#spinContainer").css("display", "none");

function onDownload() {
    g_scratchpad.clearExternal = "false";
    var targetProvider = gel('target_mp_provider_detail').value;
    var errMsgEl = $j("#err_message");
    if (!targetProvider) {
        errMsgEl.html("${gs.getMessage('Select a valid provider')}");
        errMsgEl.css("display", "block");
        return false;
    }
    var selectedProviderName = gel('selectedProviderName').value;
    var selectedProviderSysId = gel('selectedProviderSysId').value;
    var documentSysID = gel('documentSysID').value;
    var linkOnly;

    var ajaxHelper = new GlideAjax('DocumentExternalProviderUIUtils');
    ajaxHelper.addParam('sysparm_name', 'attachFromProvider');
    ajaxHelper.addParam('sysparm_providerName', selectedProviderName);
    ajaxHelper.addParam('sysparm_providerDetailSysId', selectedProviderSysId);
    ajaxHelper.addParam('sysparm_documentSysID', documentSysID);

    if (selectedProviderName.toLowerCase() == "googledrive") {
        var url = gel('fileURL').value;
        linkOnly = gel('linkOnlyGD');

        if (!url) {
            errMsgEl.html("${gs.getMessage('File URL is mandatory for provider: GoogleDrive')}");
            errMsgEl.css("display", "block");
            g_scratchpad.clearExternal = "true";
            return false;
        } else {
            ajaxHelper.addParam('sysparm_fileURL', url);
            if (linkOnly.checked)
                ajaxHelper.addParam('sysparm_linkOnly', "true");
            else
                ajaxHelper.addParam('sysparm_linkOnly', "false");
            ajaxHelper.getXMLAnswer(submitRequestToProvider);
            $j("#providerContainer").css("display", "none");
            $j("#spinContainer").css("display", "flex");
            $j("#ok_button").attr("disabled", true);
            $j("#cancel_button").attr("disabled", true);
            $j("#ds_attach_from_provider_closemodal").attr("disabled", true);
        }
    } else if (selectedProviderName.toLowerCase() == "onedrive") {
        fileName = gel('fileName').value;
        var folderPath = gel('folderPath').value;
        linkOnly = gel('linkOnlyOD');
        if (!fileName) {
            errMsgEl.html("${gs.getMessage('File Name is mandatory for provider: OneDrive')}");
            errMsgEl.css("display", "block");
            g_scratchpad.clearExternal = "true";
            return false;
        } else {
            ajaxHelper.addParam('sysparm_fileName', fileName);
            ajaxHelper.addParam('sysparm_folderPath', folderPath);
            if (linkOnly.checked)
                ajaxHelper.addParam('sysparm_linkOnly', "true");
            else
                ajaxHelper.addParam('sysparm_linkOnly', "false");

            ajaxHelper.getXMLAnswer(submitRequestToProvider);
            $j("#providerContainer").css("display", "none");
            $j("#spinContainer").css("display", "flex");
            $j("#ok_button").attr("disabled", true);
            $j("#cancel_button").attr("disabled", true);
            $j("#ds_attach_from_provider_closemodal").attr("disabled", true);
        }
    }
    return true;
}

function change() {
    var errMsgEl = $j("#err_message");
    errMsgEl.html("");
    errMsgEl.css("display", "none");
    $j("#selectedProviderName").val("");
    $j("#selectedProviderSysId").val("");
    var targetProvider = gel('target_mp_provider_detail').value;
    if (targetProvider) {
        var ajaxHelper = new GlideAjax('DocumentExternalProviderUIUtils');
        ajaxHelper.addParam('sysparm_name', 'getProviderDetails');
        ajaxHelper.addParam('sysparm_providerDetailSysId', targetProvider);
        ajaxHelper.getXMLAnswer(loadProvider);
    }
}

function loadProvider(answer) {
    if (answer) {
        var jsonAnswer = JSON.parse(answer);
        var providerName = jsonAnswer['provider_name'];
        var providerDetailSysId = jsonAnswer['provider_detail_sys_id'];
        $j("#selectedProviderName").val(providerName);
        $j("#selectedProviderSysId").val(providerDetailSysId);
        if (providerName.toLowerCase() == "googledrive") {
            $j("#googledrive").css("display", "block");
            $j("#onedrive").css("display", "none");
        }
        if (providerName.toLowerCase() == "onedrive") {
            $j("#onedrive").css("display", "block");
            $j("#googledrive").css("display", "none");
        }
    }
}

function submitRequestToProvider(answer) {
    $j("#providerContainer").css("display", "block");
    $j("#spinner").css("display", "none");
    g_form.clearMessages();
    var output = JSON.parse(answer);
    var status = output.status;
    var errorMsg = output.error_message;
    if (status.toLowerCase() != "success") {
        g_scratchpad.clearExternal = "true";
        g_form.addErrorMessage(getMessage(errorMsg));
        GlideModal.prototype.get('ds_attach_from_provider').destroy();
    } else {
        sessionStorage.setItem('ds_external_connected', 'attach');
        g_form.setValue("external_file_url", output.file_url);
        g_form.save();
    }
}

var gdw = GlideModal.prototype.get('ds_attach_from_provider');
gdw.on("beforeclose", function() {
    if (g_scratchpad.clearExternal == "true")
        g_form.clearValue('external');
});
