function clickActivate() {
    // the following is what we have to do to make this client
    // script work from a list and form, with today's code
    if (typeof rowSysId == 'undefined')
      sysId = gel('sys_uniqueValue').value;
    else
      sysId = rowSysId;

    var listView = !(gel('sys_uniqueValue') != null);

    var map = new GwtMessage().getMessages(["Activate Plugin", "Plugin not found"]);
	var dialogClass = GlideModal ? GlideModal : GlideDialogWindow;
    var dd = new dialogClass("activate_plugin_confirm");
    dd.setTitle(map["Activate Plugin"]);
    dd.setPreference('sysparm_plugin_id', sysId);
    dd.setPreference('sysparm_list_view', listView);
    dd.setPreference('sysparm_get_customized_version', true);

    dd.setWidth(500);
    dd.render();
}
