			function onChange(control, oldValue, newValue, isLoading, isTemplate) {
				if (isLoading || newValue == '') {
					return;
				}

				var name = g_form.getValue('name');
				if (name && name != '')
				// Name is already set and diverges from our label.  Don't touch it anymore.
				{
					return;
				}

				var newName = generateColumnNameFromLabel(newValue);

				var target = g_form.getControl('name');
				var ml = target.maxLength;
				if (newName.length > ml) {
					if (!target.alerted) {
						var msg = new GwtMessage();
						var values = ['Schema attribute names cannot exceed', 'characters'];
						var answer = msg.getMessages(values);
						alert(answer['Schema attribute names cannot exceed'] + " " + ml + " " + answer['characters']);
						target.alerted = true;
					}
				} else {
					target.alerted = false;
					target.value = newName;
				}
			}

			function generateColumnNameFromLabel(label) {
				var name = label.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '_');
				if (!g_user.hasRole("maint")) {
					// Customers always use the u_ prefix.
					name = "u_" + name;
				}
				
				// Compact any multiple sequential underscores
				while (name.indexOf("__") != -1) {
					name = name.replace(/__/g, "_");
				}

				// Replace any trailing underscores
				while (name != '' && name.charAt(name.length - 1) == '_') {
					name = name.substring(0, name.length - 1);
				}

				return name;
			}
			
