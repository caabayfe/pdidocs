function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
	var type = g_form.getValue('type');
	if (type != undefined || type != null || type != '') {
			var optionControl = g_form.getOption('variable_width', '25');
			var semiWidthoptionControl = g_form.getOption('variable_width', '75');
			var fullWidthoptionControl = g_form.getOption('variable_width', '100');
			switch (type) {
			case '6' : if (g_form.getOption('variable_width', ''))
							g_form.getOption('variable_width', '').text = new GwtMessage().getMessage('System Default Width ({0}) %', g_scratchpad.variable_width_props.single_line_text);
					   break;
			case '1' : if (g_form.getOption('variable_width', ''))
							g_form.getOption('variable_width', '').text = new GwtMessage().getMessage('System Default Width ({0}) %', g_scratchpad.variable_width_props.yes_no);
					   break;
			case '2' : if (g_form.getOption('variable_width', ''))
							g_form.getOption('variable_width', '').text = new GwtMessage().getMessage('System Default Width ({0}) %', g_scratchpad.variable_width_props.multi_line_text);
					   break;
			case '3' : if (g_form.getOption('variable_width', ''))
							g_form.getOption('variable_width', '').text = new GwtMessage().getMessage('System Default Width ({0}) %', g_scratchpad.variable_width_props.multiple_choice);
					   break;
			case '4' : if (g_form.getOption('variable_width', ''))
							g_form.getOption('variable_width', '').text = new GwtMessage().getMessage('System Default Width ({0}) %', g_scratchpad.variable_width_props.scale);
					   break;
			case '5' : if (g_form.getOption('variable_width', ''))
							g_form.getOption('variable_width', '').text = new GwtMessage().getMessage('System Default Width ({0}) %', g_scratchpad.variable_width_props.select_box);
					   break;
			case '7' : if (g_form.getOption('variable_width', ''))
							g_form.getOption('variable_width', '').text = new GwtMessage().getMessage('System Default Width ({0}) %', g_scratchpad.variable_width_props.checkbox);
					   break;
			case '8' : if (g_form.getOption('variable_width', ''))
							g_form.getOption('variable_width', '').text = new GwtMessage().getMessage('System Default Width ({0}) %', g_scratchpad.variable_width_props.reference);
					   break;
			case '9' : if (g_form.getOption('variable_width', ''))
							g_form.getOption('variable_width', '').text = new GwtMessage().getMessage('System Default Width ({0}) %', g_scratchpad.variable_width_props.date);
					   break;
			case '10' : if (g_form.getOption('variable_width', ''))
							g_form.getOption('variable_width', '').text = new GwtMessage().getMessage('System Default Width ({0}) %', g_scratchpad.variable_width_props.date_time);
					   break;
			case '14' : if (g_form.getOption('variable_width', ''))
							g_form.getOption('variable_width', '').text = new GwtMessage().getMessage('System Default Width ({0}) %', g_scratchpad.variable_width_props.macro);
					   break;
			case '15' : if (g_form.getOption('variable_width', ''))
							g_form.getOption('variable_width', '').text = new GwtMessage().getMessage('System Default Width ({0}) %', g_scratchpad.variable_width_props.ui_page);
					   break;
			case '16' : if (g_form.getOption('variable_width', ''))
							g_form.getOption('variable_width', '').text = new GwtMessage().getMessage('System Default Width ({0}) %', g_scratchpad.variable_width_props.wide_line_text);
					   break;
			case '17' : if (g_form.getOption('variable_width', ''))
							g_form.getOption('variable_width', '').text = new GwtMessage().getMessage('System Default Width ({0}) %', g_scratchpad.variable_width_props.macro_with_label);
					   break;
			case '18' : if (g_form.getOption('variable_width', ''))
							g_form.getOption('variable_width', '').text = new GwtMessage().getMessage('System Default Width ({0}) %', g_scratchpad.variable_width_props.lookup_select_box);
					   break;
			case '21' : if (g_form.getOption('variable_width', ''))
							g_form.getOption('variable_width', '').text = new GwtMessage().getMessage('System Default Width ({0}) %', g_scratchpad.variable_width_props.list_collector);
					   break;
			case '22' : if (g_form.getOption('variable_width', ''))
							g_form.getOption('variable_width', '').text = new GwtMessage().getMessage('System Default Width ({0}) %', g_scratchpad.variable_width_props.lookup_choice);
					   break;
			case '23' : if (g_form.getOption('variable_width', ''))
							g_form.getOption('variable_width', '').text = new GwtMessage().getMessage('System Default Width ({0}) %', g_scratchpad.variable_width_props.html);
					   break;
			case '25' : if (g_form.getOption('variable_width', ''))
							g_form.getOption('variable_width', '').text = new GwtMessage().getMessage('System Default Width ({0}) %', g_scratchpad.variable_width_props.masked);
					   break;
			case '26' : if (g_form.getOption('variable_width', ''))
							g_form.getOption('variable_width', '').text = new GwtMessage().getMessage('System Default Width ({0}) %', g_scratchpad.variable_width_props.email);
					   break;
		    case '28' :  if (g_form.getOption('variable_width', ''))
		                    g_form.getOption('variable_width', '').text = new GwtMessage().getMessage('System Default Width ({0}) %', g_scratchpad.variable_width_props.ip);
					   break; 
			case '29':
					if (g_form.getOption('variable_width', ''))
						g_form.getOption('variable_width', '').text = new GwtMessage().getMessage('System Default Width ({0}) %', g_scratchpad.variable_width_props.duration);
				break;
			case '33':
					if (g_form.getOption('variable_width', ''))
						g_form.getOption('variable_width', '').text = new GwtMessage().getMessage('System Default Width ({0}) %', g_scratchpad.variable_width_props.attachment);
				break;
					
		}

		if (optionControl) {
			// If type of Variable is HTML, Macro, Macro with Label, List Collector, UI page then hide the option 25% of variable width.
			if (type == '14' || type == '15' || type == '17' || type == '21' || type == '23')
				optionControl.style.display = 'none';
			// If type of Variable id IP then hide the option 75%, 100% of variable width.	
			else if (type == '28' || type == '29') {
				fullWidthoptionControl.style.display = 'none';
			    semiWidthoptionControl.style.display = 'none';
			}
			else
				optionControl.style.display = '';
		}
		// If container start then make the field show_help_on_load readOnly.
		if (type == '19') {
			g_form.setValue('show_help_on_load', false);
			g_form.setReadOnly('show_help_on_load', true);
		} else
			g_form.setReadOnly('show_help_on_load', false);
	}
   
}
