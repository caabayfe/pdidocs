
    	function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   			if (isLoading) {
      			return;
   			}
			var gr=new GlideRecord('sysevent_register');
			gr.get(newValue);
			g_form.setValue('table',gr.table);
		}
