function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (g_form.getReference('channel').type == 'phone' || g_form.getReference('channel').type == 'messaging' ){
		g_form.setReadOnly('account_link_type', false);
		return;
   }
   g_form.setValue('account_link_type', 'basic');
   g_form.setReadOnly('account_link_type', true);
}
