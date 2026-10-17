function onLoad() {
   //Type appropriate comment here, and begin script below
   if((g_user.hasRole('catalog_manager')||g_user.hasRole('catalog_editor')) && !g_user.hasRole('catalog_admin'))
	   g_form.setMandatory('sc_catalogs',true);
}
