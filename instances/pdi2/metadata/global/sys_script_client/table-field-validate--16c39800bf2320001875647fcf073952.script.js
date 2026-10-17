function onSubmit() {
			try {
				// clear errors if any exist
				g_form.hideFieldMsg("name");
			} catch(e) {
			}
	
			// allow creation of new records
			if (g_form.newRecord) {
				return;
			}

			var action = g_form.getActionName();
			if (action == 'sysverb_insert' || action == 'sysverb_insert_and_stay' || action == 'delete_table_complete') {
				return;
			}

			// disallow name or element change for existing records
			var answer = true;

			var o_name = "";
			var o_nameInput = gel('sys_original.sys_db_object.name');
			if (o_nameInput) {
				o_name = o_nameInput.value;
			}
			var c_name = g_form.getValue('name');
			if (o_name != c_name) {
				g_form.showFieldMsg('name', getMessage('Cannot change the name of a table after it is created'), 'error');
				g_form.addErrorMessage(getMessage('Cannot change the name of a table after it is created'));
				answer = false;
			}

			var o_super_class = "";
			var o_super_classInput = gel('sys_original.sys_db_object.super_class');
			if (o_super_classInput) {
				o_super_class = o_super_classInput.value;
			}
			var c_super_class = g_form.getValue('super_class');
			if (o_super_class != c_super_class) {
				g_form.showFieldMsg('super_class', getMessage('Cannot change what a table extends after it is created'), 'error');
				g_form.addErrorMessage(getMessage('Cannot change what a table extends after it is created'));
				answer = false;
			}
			return answer;
		}
