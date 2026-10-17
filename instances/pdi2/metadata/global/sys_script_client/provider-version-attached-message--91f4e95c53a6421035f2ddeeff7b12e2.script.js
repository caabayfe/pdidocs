function onLoad() {
    // Set in UI page ds_attach_from_provider
    // Set in UI page ds_upload_to_provider
    var action = sessionStorage.getItem('ds_external_connected');
    var deleteFile = sessionStorage.getItem('ds_external_connected_remove_attachment');
    if (!action)
        return;
    if (action === 'attach') {
        g_form.addInfoMessage(getMessage("Successfully attached file from provider to the document."));
    } else if (action === 'upload') {
        var isLocalFile = sessionStorage.getItem('ds_external_connected_local_file');
        var newVersionState = sessionStorage.getItem('ds_external_connected_new_version_state');
        if (isLocalFile) {
            if (newVersionState != 'published') {
                g_form.addInfoMessage(getMessage('A new Version has been created.'));
                g_form.addErrorMessage(getMessage('Upload failed: The new version must be published before it can be uploaded to the external cloud.'));

            } else {
                g_form.addInfoMessage(getMessage("A new version has been created and uploaded to the external cloud."));
            }
        } else
            g_form.addInfoMessage(getMessage("The default version has been uploaded to the external cloud."));
        showDeleteAttachmentMessage();

    } else if (action === 'update') {
        g_form.addInfoMessage(getMessage('A new version has been updated in the external cloud.'));
        showDeleteAttachmentMessage();
    }
    sessionStorage.removeItem('ds_external_connected_version_state');
    sessionStorage.removeItem('ds_external_connected');
    sessionStorage.removeItem('ds_external_connected_local_file');
    sessionStorage.removeItem('ds_external_connected_remove_attachment');

    function showDeleteAttachmentMessage() {
        if (deleteFile == "success")
            g_form.addInfoMessage(getMessage('The attachment has been removed from the uploaded version.'));
        else if (deleteFile == "error")
            g_form.addErrorMessage(getMessage('The attachment cannot be removed from the uploaded version.'));
    }
}
