function checkCloneStatus() {
    var gdw = new GlideDialogWindow('clone_wait');
    gdw.setTitle(getMessage("Processing.."));
    gdw.setPreference('sysparm_info', getMessage("Please wait while we get the current status of your clone."));
    gdw.render();

    var ga = new GlideAjax('InstanceCloneManagerAjax');
    ga.addParam('sysparm_name', 'getCloneStatus');
    ga.addParam('sysparm_clone_id', g_form.getUniqueValue());
    ga.getXML();

    setTimeout(function() { gdw.destroy(); reloadWindow(window); }, 2000);
}
