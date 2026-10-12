// Hide "Closed" Incident state and State from everyone but itil_admin

function onLoad() {
	if (g_user.hasRole('itil_admin'))
		return;

	if (g_form.getValue('incident_state') != '7') {
		if (typeof g_form.getChoice === 'function' && g_form.getChoice('incident_state', '7'))
			global_var_choice_display_values.incident_state = g_form.getChoice('incident_state', '7').text;
		g_form.removeOption('incident_state', 7);
	}
	if (g_form.getValue('state') != '7') {
		if (typeof g_form.getChoice === 'function' && g_form.getChoice('state', '7'))
			global_var_choice_display_values.state = g_form.getChoice('state', '7').text;
		g_form.removeOption('state', 7);
	}
}

var global_var_choice_display_values = {
	incident_state: "",
	state: ""
};
