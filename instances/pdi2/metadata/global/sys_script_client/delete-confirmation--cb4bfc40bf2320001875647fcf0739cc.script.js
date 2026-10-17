function onSubmit() {
			var action = g_form.getActionName();
			if (action != 'delete_table_complete') {
				return;
			}

			var name = prompt(getMessage('To proceed with the table deletion'), getMessage('Type the word "delete" here'));
			if (!name) {
				return false;
			}

			if (name.toLowerCase() != getMessage('delete').toLowerCase()) {
				return false;
			}

		}
