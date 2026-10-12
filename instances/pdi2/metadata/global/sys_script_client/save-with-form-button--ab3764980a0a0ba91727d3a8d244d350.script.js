function onChange(control, oldValue, newValue, isLoading) {
   if (isLoading && oldValue == 'true') {
      g_form.setReadonly('client', true);
      return;
   }
    
   if (newValue == 'true') {
      g_form.setValue('client', 'true');
      g_form.setReadonly('client', true);
      onChange('sys_ui_action.client');
   } else {
      g_form.setReadonly('client', false);
   }
}
