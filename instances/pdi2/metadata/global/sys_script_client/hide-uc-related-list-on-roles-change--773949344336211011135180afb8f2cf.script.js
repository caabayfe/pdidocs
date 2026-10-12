function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading) {
      return;
   }

	if (g_scratchpad.ucEnabled == 'true') {
		if (newValue != '') {
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
