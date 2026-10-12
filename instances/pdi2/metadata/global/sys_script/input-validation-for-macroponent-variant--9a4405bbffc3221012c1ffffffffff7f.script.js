(function executeRule(current, previous /*null when async*/) {
	
	/**
	 * Requirements:
	 * 1. Default & Variant Macroponent cannot be the same
	 * 2. There cannot be multiple Variants of the same device type per a single default macroponent
	 * 3. Macroponent categories must be the same value
	 * 4. Macroponent category must be a supported category for mobile adaptive
	 */
	try {
		
		var SUPPORTED_CATEGORIES = ['component', 'page', 'sub_page'];

		var defaultMacroponent = current.getElement('default_macroponent');
		var variantMacroponent = current.getElement('variant_macroponent');
		var deviceType = current.getElement('device_type');

		// Invalid Check: If default & Variant Macroponent are the same
		// Rhino behavior allows for object comparison that differs from normal javascript
		if (defaultMacroponent == variantMacroponent) {
			throw "Default Macroponent & Variant Macroponent cannot be the same.";
		}

		// Invalid Input Check: If multiple variants of the same device type per a single default macroponent
		var gr = new GlideRecord('sys_ux_macroponent_variant');
		gr.addQuery('default_macroponent', defaultMacroponent);
		gr.addQuery('device_type', deviceType);
		gr.query();
		while (gr.next()) {
			if(!(gr.getElement('sys_id') == current.getElement('sys_id'))){
				throw "Only one variant per device type allowed for this default macroponent";
			}
		}

		// Invalid Input Check: If Macroponents have different or unsupported categories for mobile adaptive macroponent merge
		gr = new GlideRecord('sys_ux_macroponent');
		gr.get('sys_id', defaultMacroponent);
		var defaultCategory = gr.getValue('category');
		gr.get('sys_id', variantMacroponent);
		var variantCategory = gr.getValue('category');

		if( defaultCategory !== variantCategory ||
			!SUPPORTED_CATEGORIES.includes(defaultCategory)){
				throw "Macroponents must be of the same supported category (Page, Sub Page, or Component)";
		}

	} catch (e) {
		gs.addErrorMessage(gs.getMessage(e));
		current.setAbortAction(true);
		return;
	}

})(current, previous);
