function onCondition() {
    if(!g_form.isNewRecord()) {
        var createModule = gel("element.sys_db_object.create_module");
        if(createModule != null)
            createModule.style.display = 'none';
        
		var showInMenu = gel("show_in_menu_div");
        if(showInMenu != null)
            showInMenu.style.display = 'none';
    }
}
