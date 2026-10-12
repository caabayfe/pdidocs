function onSubmit() {
    // We only intercept insert, update, and save actions.  Not random UI actions.
    if(!g_form.getActionName().startsWith('sysverb_update') && g_form.getActionName() != 'sysverb_insert')
        return true;
    
    // Only need to validate the name for new tables
    if (!g_form.isNewRecord()) {
        return true;
    }
    
    var createModule = gel("ni.sys_db_object.create_module");
    if(createModule == null || !createModule.checked)
        return true;
    
    var menuSelect = gel("ni.java.com.snc.apps.ShowInMenuFormatterAction[selected_application]");
    var newMenuName = gel("ni.java.com.snc.apps.ShowInMenuFormatterAction[new_menu_name]");
    var showInMenu =  gel("label.sys_db_object.app_name");
    
    if(menuSelect.options[menuSelect.selectedIndex].value == "") {
        if(newMenuName.value == "") {
            var message = "New menu name required";
            this.g_form.showFieldMsg(showInMenu.firstChild, getMessage(message), 'error');
            return false;
        }
        var numOptions = menuSelect.options.length;
        var message = "";
        for(var i = 1; i < numOptions; i++) {
            if(newMenuName.value == menuSelect.options[i].text) {
                message = "Menu already defined";
                break;
            }
        }
        if(message != "") {
            this.g_form.showFieldMsg(showInMenu.firstChild, getMessage(message), 'error');
            return false;
        }
    }
    return true;
}
