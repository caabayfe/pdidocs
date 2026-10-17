
			function onChange(control, oldValue, newValue, isLoading, isTemplate) {
				if (isLoading || newValue == '') {
					return;
				}

				//Type appropriate comment here, and begin script below

				var name = g_form.getControl('name');
				if (name && name.value != '') {
					// Name is already set.  We won't change it automatically here.
					return;
				}

				var newName = newValue.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '_');
				name.value = newName;
			}
			
