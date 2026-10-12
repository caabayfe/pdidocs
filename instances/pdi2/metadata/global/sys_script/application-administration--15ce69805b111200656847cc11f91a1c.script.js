(function executeRule(current, previous /*null when async*/) {
    if (JSUtil.getBooleanValue(current, 'scoped_administration') && !GlideProperties.getBoolean('glide.security.scoped_administration', true)) {
        gs.addErrorMessage(gs.getMessage("Application administration is not enabled on this instance."));
        current.setAbortAction(true);
        return;
    }
    
    var sa = new ScopedAdministration();
    var scopeAdminRoles = sa.getScopeAdminRolesArray(current);
    var preface = gs.getMessage("Application Administration uses the 'Application Administrator' role to define what users are application administrators.");
    
    if (JSUtil.getBooleanValue(current, 'scoped_administration') && scopeAdminRoles.length == 0) {
        gs.addErrorMessage(preface + " " + gs.getMessage("None of the roles defined by this application have 'Application Administrator' enabled."));
        current.setAbortAction(true);
        return;
    }
    
    if (JSUtil.getBooleanValue(current, 'scoped_administration') && !sa.currentUserIsScopeAdmin(current, true)) {
        gs.addErrorMessage(preface + " " + gs.getMessage("The logged-in user must have the 'Application Administrator' role to enable Application Administration."));
        current.setAbortAction(true);
        return;
    }
    
    GlideCacheManager.flush('application_menu_list');
    GlideCacheManager.flush('application_rest_menu_list');
    GlideCacheManager.flush('sys_ui_action_service');
    SNC.FormsCacheFlushHandler.flush(current.getTableName());
    
})(current, previous);
