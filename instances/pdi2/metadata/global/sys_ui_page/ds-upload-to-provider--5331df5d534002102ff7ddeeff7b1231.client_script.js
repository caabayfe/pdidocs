var versionSysId = '';
var documentSysId = gel('documentSysID').value;
var isDefaultVersionExist = !!gel('defaultVersion').value;
var externalFileName = gel('externalFileName').value;
var defaultVersionFileName = gel('defaultVersionFileName').value;
var isUploadLocalFile;
var isNewVersionCreated = false;
var isConnectionExists = false;
var removeAttachment = false;
var uploadFileConfirmationMessage = getMessage("Uploading this file will overwrite the document in the external cloud.");
var uploadVersionConfirmationMessage = getMessage("Uploading this version will overwrite the document in the external cloud.");
var inConfirmationMode = false;
var defaultVersionRadio = document.querySelector(".upload_default_version_radio");
var localFileRadio = document.querySelector(".upload_local_file_radio");
if (gel("selectedProviderName").value != "") {
    isConnectionExists = true;
    gel("fillProviderDetails").addClassName("hidden");
    hideOrShowUploadOptions();
}

$j("#uploadLocalFile").on('click', function(e) {
    e.preventDefault();
    $j("#fileUpload").trigger('click');
});

document.querySelector("#upload_default_version_radio").addEventListener('change', function(e) {
    hideErrorMessage();
    showUploadDefaultVersionUnderRadio();
});

document.querySelector("#upload_local_file_radio").addEventListener('change', function(e) {
    hideErrorMessage();
    showUploadLocalFileUnderRadio();
});

function showUploadLocalFileUnderRadio() {
    gel('uploadLocalFileBlock').removeClassName('hidden');
    gel('uploadLocalFileBlock').addClassName('under-radio');
    gel('uploadDefaultVersionBlock').addClassName('hidden');
    isUploadLocalFile = true;
}

function showUploadDefaultVersionUnderRadio() {
    gel('uploadDefaultVersionBlock').removeClassName('hidden');
    gel('uploadLocalFileBlock').addClassName('hidden');
    isUploadLocalFile = false;
}

function showOnlyLocalFileUpload() {
    gel('uploadToProviderWrapper').removeClassName("hidden");
    // Hide radio buttons
    defaultVersionRadio.addClassName("hidden");
    localFileRadio.addClassName("hidden");
    // Show upload local file
    gel('uploadLocalFileBlock').removeClassName('hidden');
    isUploadLocalFile = true;
}

function showUploadRadioOptions() {
    gel('uploadToProviderWrapper').removeClassName("hidden");
    // Show radio buttons
    defaultVersionRadio.removeClassName("hidden");
    localFileRadio.removeClassName("hidden");
    // Check the default version radio
    gel('upload_default_version_radio').setAttribute('checked', 'checked');
    showUploadDefaultVersionUnderRadio();
}

function hideOrShowUploadOptions() {
    //If there is no default version.
    if (gel('defaultVersion').value == "" || gel('versionType').value != 'attachment') {
        showOnlyLocalFileUpload();
    } else {
        // If default version exists.
        if (isConnectionExists) {
            if (gel("defaultMPVersion").value == "") {
                showUploadRadioOptions();
            } else {
                showOnlyLocalFileUpload();
            }
        } else {
            showUploadRadioOptions();
        }
    }
}

// When file is added from the local system.
gel('fileUpload').onchange = function(e) {
    hideErrorMessage();
    var fileNameEle = gel('file-card-name');
    var fileName = e.target.files[0].name;
    gel('file-card').removeClassName('hidden');
    fileNameEle.setAttribute('data-original-title', fileName);
    fileNameEle.setAttribute('aria-label', fileName);
    fileNameEle.innerText = fileName;
    gel('uploadLocalFile').addClassName('disabled');
    gel('uploadLocalFile').tabIndex = -1;
};

// When provider is selected in the dialog.
function providerChange() {
    hideErrorMessage();
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

// Loading the provider details and updating the UI according to the provider details.
function loadProvider(answer) {
    if (answer) {
        var jsonAnswer = JSON.parse(answer);
        var providerName = jsonAnswer['provider_name'];
        var providerDetailSysId = jsonAnswer['provider_detail_sys_id'];
        $j("#selectedProviderName").val(providerName);
        $j("#selectedProviderSysId").val(providerDetailSysId);
        if (providerName.toLowerCase() == "googledrive") {
            gel("googledrive").removeClassName("hidden");
            gel("onedrive").addClassName("hidden");
        }
        if (providerName.toLowerCase() == "onedrive") {
            gel("onedrive").removeClassName("hidden");
            gel("googledrive").addClassName("hidden");
        }
        hideOrShowUploadOptions();
    }
}

function deleteFile(e) {
    gel('file-card').addClassName('hidden');
    gel('uploadLocalFile').removeClassName('disabled');
    gel('fileUpload').value = '';
    gel('uploadLocalFile').tabIndex = 0;
}

function onUpload() {
    hideErrorMessage();
    if (!isConnectionExists)
        uploadNewDocument();
    else {
        updateDocument();
    }
}

function updateDocument() {
    var selectedProviderName = gel('selectedProviderName').value;
    var externalfileExt = externalFileName.split('.').pop();
    // If local file
    if (isUploadLocalFile) {
        if (gel('fileUpload').value != "") {
            var fileName = gel('fileUpload').files[0].name;
            var fileExt = fileName.split('.').pop();
            if (fileExt != externalfileExt)
                showErrorMessage(getMessage('File extension should match with the file extension in external cloud'));
            else if (inConfirmationMode) {
                uploadAttachmentToDummyRecord();
            } else
                showConfirmationMessage(getMessage("Upload local file?"), uploadFileConfirmationMessage);

        } else {
            showErrorMessage(getMessage('Select a file to upload.'));
        }
    } else { // If default version
        var defaultVersionFileExt = defaultVersionFileName.split('.').pop();
        if (defaultVersionFileExt != externalfileExt)
            showErrorMessage(getMessage('File extension in default version should match with the file extension in external cloud'));
        else if (inConfirmationMode) {
            updateNewVerionToProvider();
        } else
            showConfirmationMessage(getMessage("Upload version {0}?").withValues([gel('defaultVersion').value]), uploadVersionConfirmationMessage);
    }
}

function showConfirmationMessage(title, message) {
    gel("ds_upload_to_provider_title").innerText = title;
    gel("confirmationMessage").removeClassName("hidden");
    gel("mainContainer").addClassName("hidden");
    gel("confirmationMessage").querySelector('p').innerText = message;
    inConfirmationMode = true;
}

function hideConfirmationMessage() {
    gel("confirmationMessage").addClassName("hidden");
    inConfirmationMode = false;
}

function uploadNewDocument() {
    var selectedProviderName = gel('selectedProviderName').value;
    g_scratchpad.clearExternal = "false";
    var targetProvider = gel('target_mp_provider_detail').value;
    if (!targetProvider) {
        showErrorMessage(getMessage('Select a valid External Provider'));
        return false;
    }
    if (selectedProviderName.toLowerCase() == "googledrive") {
        var url = gel('folderURL').value;
        if (!url) {
            showErrorMessage(getMessage('Folder URL is mandatory for provider: GoogleDrive'));
            g_scratchpad.clearExternal = "true";
            return false;
        }
    }

    if (isUploadLocalFile) {
        if (gel('fileUpload').value != "") {
            uploadAttachmentToDummyRecord();
        } else {
            showErrorMessage(getMessage('Select a file to upload.'));
        }
    } else {
        uploadToProvider();
    }
}
// Uploads the local file to a dummy record.
function uploadAttachmentToDummyRecord() {
    var selectedProviderName = gel('selectedProviderName').value;

    if (!isConnectionExists) showSpinner(getMessage("Creating a new version and uploading to {0}...").withValues([selectedProviderName]));
    else {
        showSpinner(getMessage("Creating new version and updating in {0}...").withValues([selectedProviderName]));
        hideConfirmationMessage();
    }
    var sysId = gel('documentSysID').value;
    var table = "ds_document";
    var file = gel('fileUpload').files[0];
    var formData = new FormData();
    formData.append("sysparm_table", table);
    formData.append("sysparm_sys_id", sysId);
    formData.append("sysparm_nostack", 'yes');
    formData.append("attachments_modified", true);
    formData.append("sysparm_ck", window.g_ck);
    formData.append("file", file);
    var url = "/angular.do?sysparm_type=ngk_attachments&action=add&table=" + table + "&sys_id=" + sysId;
    var request = $j.ajax({
        url: url,
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: createVersion,
        error: function(request, status, error) {
            showErrorMessage(getMessage('Document upload failed. Please try again.'));
            hideSpinner();
        }
    });
}

// After successful upload of attachment, create a version and shift the attachment to version from dummy record.
function createVersion(attachmentData) {
    if (attachmentData.sys_id) {
        var attachmentSysId = attachmentData.sys_id;
        var documentSysID = gel('documentSysID').value;
        var ajaxHelper = new GlideAjax('DocumentExternalProviderUIUtils');
        ajaxHelper.addParam('sysparm_name', 'addVersion');
        ajaxHelper.addParam('sysparm_documentSysID', documentSysID);
        ajaxHelper.addParam('sysparm_attachmentSysID', attachmentSysId);
        //Create a new version
        ajaxHelper.getXMLAnswer(function(answer) {
            var data = JSON.parse(answer);
            versionSysId = data.versionSysID;
            isNewVersionCreated = true;
            validateBeforeUploadToProvider();
        });
    } else {
        hideSpinner();
        showErrorMessage(attachmentData.error);
    }
}
// Uploads to provider only if the newly created version is the default version.
function validateBeforeUploadToProvider() {
    // Get the state of the version
    var ajaxHelper = new GlideAjax('DocumentExternalProviderUIUtils');
    ajaxHelper.addParam('sysparm_name', 'getVersionState');
    ajaxHelper.addParam('sysparm_versionSysID', versionSysId);
    ajaxHelper.getXMLAnswer(function(versionState) {
        if (versionState == 'published' && !isConnectionExists)
            uploadToProvider();
        else if (versionState == 'published' && isConnectionExists) {
            updateNewVerionToProvider();
        } else {
            // When new version is created but it is not in published state to upload to provider.
            GlideModal.prototype.get('ds_upload_to_provider').destroy();
            sessionStorage.setItem('ds_external_connected', 'upload');
            sessionStorage.setItem('ds_external_connected_local_file', true);
            sessionStorage.setItem('ds_external_connected_new_version_state', versionState);
            g_form.save(); // To refresh the page.
        }
    });
}

// It uploads the default version of the document to provider.
function uploadToProvider() {
    var selectedProviderName = gel('selectedProviderName').value;
    var selectedProviderSysId = gel('selectedProviderSysId').value;
    var documentSysID = gel('documentSysID').value;
    if (isUploadLocalFile)
        removeAttachment = gel("donot-store-attachment").checked;
    else
        removeAttachment = gel("remove-attachment").checked;
    // TODO: saving the UI inputs for now, actual multiprovider call to connect is pending
    var ajaxHelper = new GlideAjax('DocumentExternalProviderUIUtils');
    ajaxHelper.addParam('sysparm_name', 'uploadToProvider');
    ajaxHelper.addParam('sysparm_providerName', selectedProviderName);
    ajaxHelper.addParam('sysparm_providerDetailSysId', selectedProviderSysId);
    ajaxHelper.addParam('sysparm_documentSysID', documentSysID);
    ajaxHelper.addParam('sysparm_delete_attachment', removeAttachment);

    if (selectedProviderName.toLowerCase() == "googledrive") {
        var url = gel('folderURL').value;
        ajaxHelper.addParam('sysparm_folderURL', url);
        ajaxHelper.getXMLAnswer(afterUploadToProviderTrial);
        if (!isNewVersionCreated) {
            showSpinner(getMessage("Uploading to {0}...").withValues([selectedProviderName]));
        }
    } else if (selectedProviderName.toLowerCase() == "onedrive") {
        // var fileName = gel('fileName').value;
        var folderPath = gel('folderPath').value;
        ajaxHelper.addParam('sysparm_folderPath', folderPath);
        ajaxHelper.getXMLAnswer(afterUploadToProviderTrial);
        if (!isNewVersionCreated) {
            showSpinner(getMessage("Uploading to {0}...").withValues([selectedProviderName]));
        }
    }
    //gsftSubmit(null, g_form.getFormElement(), GlideModal.get().getPreference('sysparm_action_name'));
    return true;
}

function updateNewVerionToProvider() {
    var selectedProviderName = gel('selectedProviderName').value;
    var documentSysID = gel('documentSysID').value;
    if (isUploadLocalFile) {
        removeAttachment = gel("donot-store-attachment").checked;
    } else {
        removeAttachment = gel("remove-attachment").checked;
        showSpinner(getMessage("Updating new version in {0}...").withValues([selectedProviderName]));
    }

    var ajaxHelper = new GlideAjax('DocumentExternalProviderUIUtils');
    ajaxHelper.addParam('sysparm_name', 'updateVersionToProvider');
    ajaxHelper.addParam('sysparm_documentSysID', documentSysID);
    ajaxHelper.addParam('sysparm_delete_attachment', removeAttachment);
    ajaxHelper.getXMLAnswer(afterUpdateVersionToProviderTrial);
    hideConfirmationMessage();
    return true;
}

function afterUpdateVersionToProviderTrial(answer) {
    g_form.clearMessages();
    var output = JSON.parse(answer);
    var status = output.status;
    var errorMsg = output.error_message;

    if (status.toLowerCase() != "success") {
        if (isNewVersionCreated) {
            g_form.addInfoMessage(getMessage('A new Version has been created.'));
            g_form.addErrorMessage(getMessage('Document upload failed. Please try again.'));
            isNewVersionCreated = false;
        }
        g_form.addErrorMessage(errorMsg);
        g_scratchpad.clearExternal = "true";
    } else {
        sessionStorage.setItem('ds_external_connected', 'update');
        if (output.offloadFileStatus == "success")
            sessionStorage.setItem('ds_external_connected_remove_attachment', 'success');
        else if (output.offloadFileStatus == "error")
            sessionStorage.setItem('ds_external_connected_remove_attachment', 'error');
        if (output.file_url)
            g_form.setValue("external_file_url", output.file_url);
        g_form.save();
    }
    GlideModal.prototype.get('ds_upload_to_provider').destroy();
}

function afterUploadToProviderTrial(answer) {
    gel("mainContainer").removeClassName("hidden");
    $j("#spinner").css("display", "none");
    g_form.clearMessages();
    var output = JSON.parse(answer);
    var status = output.status;
    var errorMsg = output.error_message;
    if (status.toLowerCase() != "success") {
        if (isNewVersionCreated) {
            g_form.addInfoMessage(getMessage('A new Version has been created.'));
            g_form.addErrorMessage(getMessage('Document upload failed. Please try again.'));
            isNewVersionCreated = false;
        }
        g_form.addErrorMessage(errorMsg);
        g_scratchpad.clearExternal = "true";
    } else {
        if (isNewVersionCreated) {
            sessionStorage.setItem('ds_external_connected_new_version_state', 'published');
            sessionStorage.setItem('ds_external_connected_local_file', true);
        }
        sessionStorage.setItem('ds_external_connected', 'upload');
        if (output.offloadFileStatus == "success")
            sessionStorage.setItem('ds_external_connected_remove_attachment', 'success');
        else if (output.offloadFileStatus == "error")
            sessionStorage.setItem('ds_external_connected_remove_attachment', 'error');
        g_form.setValue("external_file_url", output.file_url);
        g_form.save();
    }
    GlideModal.prototype.get('ds_upload_to_provider').destroy();
}

function showSpinner(message) {
    if (message)
        gel("spinnerLabel").innerText = message;
    gel("mainContainer").addClassName("hidden");
    gel("spinContainer").removeClassName("hidden");
    $j("#ok_button").attr("disabled", true);
    $j("#cancel_button").attr("disabled", true);
    $j("#ds_upload_to_provider_closemodal").attr("disabled", true);
}

function hideSpinner() {
    gel("mainContainer").removeClassName("hidden");
    gel("spinContainer").addClassName("hidden");
    $j("#ok_button").attr("disabled", false);
    $j("#cancel_button").attr("disabled", false);
    $j("#ds_upload_to_provider_closemodal").attr("disabled", false);
}

function showErrorMessage(message) {
    var errMsgEl = $j("#err_message");
    errMsgEl.html(message);
    errMsgEl.css("display", "block");
}

function hideErrorMessage() {
    var errMsgEl = $j("#err_message");
    errMsgEl.html("");
    errMsgEl.css("display", "none");
}

var gdw = GlideModal.prototype.get('ds_upload_to_provider');
gdw.on("beforeclose", function() {
    if (g_scratchpad.clearExternal == "true") {
        g_form.clearValue('external');
    }
});

// For keyboard accessibility
gel('ds_upload_to_provider').addEventListener("keydown", function(event) {
    if (event.key == "Tab" && event.shiftKey && document.activeElement === gel("ds_upload_to_provider_closemodal"))
        gel("tab-helper").focus();
});
gel('ds_upload_to_provider').addEventListener("keyup", function(event) {
    if (event.key == "Tab" && event.target === gel("tab-helper"))
        gel("ds_upload_to_provider_closemodal").focus();
});
