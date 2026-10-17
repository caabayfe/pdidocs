function onLoad() {
   if (!g_user.hasRole('pa_admin') && !g_user.hasRole('pa_target_admin') && !g_user.hasRole('pa_power_user'))
	   g_form.setVisible('any_element', false);
}
