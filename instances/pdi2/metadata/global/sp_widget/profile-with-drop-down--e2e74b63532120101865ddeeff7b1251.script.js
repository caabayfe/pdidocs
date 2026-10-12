(function() {
    /* populate the 'data' object */
    /* e.g., data.table = $sp.getValue('table'); */
    data.canImpersonate = new GlideImpersonate().canImpersonate(gs.getUserID());
    data.isImpersonating = new GlideImpersonate().isImpersonating();
    data.realUser = gs.getImpersonatingUserID();
    data.profileBtnMsg = gs.getMessage("User options");
    data.modalTitle = gs.getMessage("Impersonate user");
    data.isimpersonationenabled = options.isimpersonationenabled && gs.getProperty('glide.ui.impersonate_button.enable', 'true')=='true' ? true : false;

    /*Checking if employee profile plugin is active to show preferences*/
    if(GlidePluginManager.isActive('sn_employee'))
        /*true if employee profiles is opted*/
        data.isEmployeeProfilesEnabled = GlideApplicationProperty.getValue('sn_employee.employee_profile_enabled')=='true' ? true : false;
    else 
        data.isEmployeeProfilesEnabled = false;
})();
