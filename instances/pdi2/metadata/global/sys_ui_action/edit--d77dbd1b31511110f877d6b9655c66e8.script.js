function launchCategoryEditDialog(){
	var gdw=new GlideModal('edit_associated_content');
	gdw.setTitle(getMessage('Edit associated catalog or knowledge categories'));
	gdw.setPreference('sysparm_topic_name', g_form.getValue('name'));
	gdw.setWidth(700);
	gdw.render();
}
