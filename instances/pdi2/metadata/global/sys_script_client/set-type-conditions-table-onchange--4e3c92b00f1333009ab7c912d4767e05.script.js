function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading) {
      return;
   }
	if (!newValue)
		g_form.setValue("activity_property_conditions_table", "");
	else
		g_form.setValue("activity_property_conditions_table", "var__m_sys_pd_activity_type_prop_"+newValue);
}
