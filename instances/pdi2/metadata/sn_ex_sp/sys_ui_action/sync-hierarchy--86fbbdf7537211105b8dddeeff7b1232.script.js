 function syncMenuItems() {
    var gwt = new GwtMessage();
    var messageMap = gwt.getMessages(["Confirm sync", "Sync", "Cancel"]);
    var dialog = new GlideModal('glide_modal_confirm', false, 400);
    dialog.setTitle(messageMap["Confirm sync"]);
    dialog.setPreference('body', gwt.getMessage("This brings in any new topics or menu items in the hierarchy. You can make edits to them after the sync is complete. %3cbr%3e Once the sync completes you will be notified via email. %3cbr%3e Do you want to sync now?"));
    dialog.setPreference('buttonLabelComplete', messageMap["Sync"]);
    dialog.setPreference('onPromptComplete', onConfirm);
    dialog.setPreference('buttonLabelCancel', messageMap["Cancel"]);
    dialog.setPreference('onPromptCancel', onCancel);
    dialog.render();
}

function onConfirm() {
    var ga = new GlideAjax('PortalExtensibleNavigationAjax');
    ga.addParam('sysparm_name', 'syncExtensibleMenuItems');
    ga.addParam('sysparm_sysId', g_form.getUniqueValue());
    ga.addParam('sysparm_tableName', g_form.getTableName());
    ga.getXML();
}

function onCancel() {}
