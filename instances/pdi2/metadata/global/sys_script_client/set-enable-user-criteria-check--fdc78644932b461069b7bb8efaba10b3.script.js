function onChange(control, oldValue, newValue, isLoading, isTemplate) {
		if (newValue === '') {
			g_form.setReadOnly('enable_user_criteria_check', false);
			g_form.setReadOnly('available_for', false);
			g_form.setReadOnly('not_available_for', false);
			return;
		}

		g_form.getReference('parent_topic', changeValue);

		function changeValue(parent_topic) { // reference is passed into callback as first arguments
			if (parent_topic.getValue('enable_user_criteria_check') == 'true')
				g_form.setValue('enable_user_criteria_check', true);
			else
				g_form.setValue('enable_user_criteria_check', false);
			g_form.setReadOnly('enable_user_criteria_check', true);
			if(g_form.isNewRecord()) {
				g_form.setReadOnly('available_for', true);
				g_form.setReadOnly('not_available_for', true);
			}
		}


	}
