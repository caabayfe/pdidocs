(function executeRule(current, previous /*null when async*/ ) {

    if (!GlidePluginManager.isActive('com.snc.mid.enhanced_security.oauth') && current.use_mid == true) {
        gs.addErrorMessage(gs.getMessage("'Connect to Auth Server via MID' option is supported only when 'OAuth 2.0 via MID' plugin is installed."));
        current.setAbortAction(true);
    }

    if (!GlidePluginManager.isActive('com.snc.mid.enhanced_security.oauth_vault') && current.use_high_security == true) {
        gs.addErrorMessage(gs.getMessage("'External credential store' option is supported only when 'OAuth 2.0 via MID with External Vault' plugin is installed."));
        current.setAbortAction(true);
    }

})(current, previous);
