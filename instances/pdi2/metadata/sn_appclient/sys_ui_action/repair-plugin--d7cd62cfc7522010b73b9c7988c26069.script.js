function reinstallPlugin() {
      var scope = g_form.getValue("scope");

      var map = new GwtMessage().getMessages(["Activate Plugin", "Plugin not found"]);
	  var dialogClass = GlideModal ? GlideModal : GlideDialogWindow;
      var dd = new dialogClass("activate_plugin_confirm");
      dd.setTitle(map["Activate Plugin"]);
      dd.setPreference('sysparm_plugin_scope', scope);
      dd.setPreference('sysparm_list_view', false);
      dd.setPreference('sysparm_get_customized_version', true);

      dd.setWidth(500);
      dd.render();
}
