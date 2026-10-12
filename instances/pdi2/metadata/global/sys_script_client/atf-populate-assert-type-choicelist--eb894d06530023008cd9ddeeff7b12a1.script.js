function onLoad() {
	var msgMap = new GwtMessage().getMessages(["Enabled", "Disabled", "Editable", "Read Only"]);
	addRenderEvent(function() { 
		var event = (function event (control, oldValue, newValue, isLoading, isTemplate) {
			var ctrl = g_form.getControl("sys_atf_step.inputs.var__m_atf_input_variable_38907e937322130007d738682bf6a742.component");
			
			// Prevent trying to access a component before the user selects one
			var data = $j(ctrl).select2("data");
			if (data == null)
				return;
			
			
			var parsed = JSON.parse(data.locator);
			var methods = parsed["methods"];
			var isDisabled = parsed["isDisabled"];
			
			if (methods.indexOf("click") !== -1) { // Component is a clickable component
				g_form.removeOption("assert_type", "editable");
				g_form.removeOption("assert_type", "read_only");
				// If the form is loading, these options are already present so we don't need to add them.
				// Also, the user has already selected a component + assert type so we don't need to forcibly setValue
				if (!isLoading) {
					g_form.addOption("assert_type", "enabled", msgMap["Enabled"]);
					g_form.addOption("assert_type", "disabled", msgMap["Disabled"]);
					if (isDisabled)
						g_form.setValue("assert_type", "disabled");
					else
						g_form.setValue("assert_type", "enabled");
				}
			} else { // Component is a settable component
				g_form.removeOption("assert_type", "enabled");
				g_form.removeOption("assert_type", "disabled");
				// If the form is loading, these options are already present so we don't need to add them.
				// Also, the user has already selected a component + assert type so we don't need to forcibly setValue
				if (!isLoading) {
					g_form.addOption("assert_type", "read_only", msgMap["Read Only"]);
					g_form.addOption("assert_type", "editable", msgMap["Editable"]);
					if (isDisabled)
						g_form.setValue("assert_type", "read_only");
					else
						g_form.setValue("assert_type", "editable");
				}
			}
		});

		var thisHandler = new GlideEventHandler('event', event, 'sys_atf_step.inputs.var__m_atf_input_variable_38907e937322130007d738682bf6a742.component');
		g_event_handlers.push(thisHandler);
	});  
} 
