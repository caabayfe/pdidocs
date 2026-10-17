function onLoad() {
   if (g_scratchpad.ucEnabled == 'true') {
		if (g_form.getValue('roles') != '')	{
			g_form.hideRelatedList('sys_ux_criteria_m2m_inclusion.applicability_list');
			g_form.hideRelatedList('sys_ux_criteria_m2m_exclusion.applicability_list');
		} else {
			g_form.showRelatedList('sys_ux_criteria_m2m_inclusion.applicability_list');
			g_form.showRelatedList('sys_ux_criteria_m2m_exclusion.applicability_list');
		}
	}
	else {
		g_form.hideRelatedList('sys_ux_criteria_m2m_inclusion.applicability_list');
		g_form.hideRelatedList('sys_ux_criteria_m2m_exclusion.applicability_list');
	}
}
