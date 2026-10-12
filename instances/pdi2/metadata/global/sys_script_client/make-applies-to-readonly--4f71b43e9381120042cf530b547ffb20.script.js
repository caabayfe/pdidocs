function onLoad() {
   //Type appropriate comment here, and begin script below
	if(!g_user.hasRole('catalog_admin') && (g_user.hasRole('catalog_manager')||g_user.hasRole('catalog_editor')))
	   g_form.setReadOnly('applies_to',true);
}
