function onChange(control, oldValue, newValue, isLoading)
			{
			var source = g_form.getValue('backup_source');
			if (source != '')
			return;

			if (newValue == source)
			return;

			g_form.setValue('backup_source', newValue);
			}
		
