function ok() {
    var ajaxHelper = new GlideAjax('AvailabilityCalculateAjax');
    ajaxHelper.addParam('sysparm_name', 'calculateAvailabilityForAll');
    ajaxHelper.setWantSessionMessages(false);
    ajaxHelper.getXML(hideRecalculateButton);

    function hideRecalculateButton() {
        var gr = new GlideRecord("sys_ui_action");
        gr.addQuery("sys_id", "78b8d1014f09021028d79e4628c7149a");
        gr.query();
        while (gr.next()) {
            gr.setValue("active", false);
            gr.update();
        }
        GlideDialogWindow.get().destroy();
        g_navigation.reloadWindow();
    }
    return true;
}

function cancel() {
    GlideDialogWindow.get().destroy();
    return false;
}
