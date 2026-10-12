function onLoad() {
   //Type appropriate comment here, and begin script below
   if (g_user.hasRole('maint'))
		g_form.addInfoMessage(nowapi.g_i18n.getMessage("Please set the next_dish_ping field in the sys_service table further in the future if you want to do manual testing with endpoints."));

}
