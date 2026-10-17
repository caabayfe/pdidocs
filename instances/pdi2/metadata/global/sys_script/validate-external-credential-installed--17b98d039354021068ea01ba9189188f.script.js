(function executeRule(current, previous /*null when async*/ ) {

    var pluginId = "com.snc.discovery.external_credentials";
    var pluginManager = new GlidePluginManager();
    var isEnabled = pluginManager.isActive(pluginId);
    if (isEnabled === false) {
        gs.addErrorMessage(sn_i18n.Message.getMessage("MID_Azure_SSH_Certificate_Plugin_Check_warning_message", 'External Credential Storage plugin is not installed.Please install it to create Azure SSH Certificate credential'));
        current.setAbortAction(true);
    }

})(current, previous);
