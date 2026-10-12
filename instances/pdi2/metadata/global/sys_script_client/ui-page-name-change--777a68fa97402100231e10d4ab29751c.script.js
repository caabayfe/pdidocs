function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue == '') {
      return;
   }
	
   if (newValue) {
      if (newValue != oldValue) {
         var scope = g_scratchpad.scope;
		 if (scope != 'global') {
			var pageName = g_form.getValue('name'); 
		    g_form.setVisible('endpoint', true);
            g_form.setValue('endpoint', scope + '_' + pageName + '.do');
		 } else {
			g_form.setVisible('endpoint', false);
		 }
      }
   }    
}
