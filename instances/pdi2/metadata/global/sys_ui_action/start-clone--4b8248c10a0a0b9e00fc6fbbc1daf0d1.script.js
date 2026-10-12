function showCloneDialog() {
    var cloneName = g_form.getValue('name');
    var haDbSysID = g_form.getUniqueValue();
    var message = "Waiting for clone to start";

    var sysparmQuery = "name=" + cloneName +
                       "^ha_database=" + haDbSysID +
                       "^message=" + message;

    var dialog = new GlidePaneForm('clone_dialog', 'ha_clone');
    dialog.setTitle("Start Clone");
    dialog.addParm('sysparm_query', sysparmQuery);
    dialog.addParm('sysparm_view', 'clone_dialog');
    dialog.addParm('sys_id', '-1');
    dialog.addParm('sysparm_link_less', 'true');
    dialog.addParm('sysparm_titleless', 'true');
    dialog.addParm('sysparm_form_only', 'true');
    dialog.setCompletionCallback(doRedirect);
    dialog.render();
}

function doRedirect(type, sysID) {
    self.location = "ha_clone.do?sys_id=" + sysID;
}
