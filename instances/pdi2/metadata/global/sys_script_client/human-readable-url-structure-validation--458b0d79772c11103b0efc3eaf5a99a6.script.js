function onSubmit() {
	// g_scratchpad.isFormValid will be true when form is re-submitted after the asynchronous validation is successful.
	if (g_scratchpad.isFormValid) {
		return true;
	}

	g_form.hideFieldMsg('human_readable_url_structure', true);
	var action = g_form.getActionName();
	if (action == 'sysverb_back' || action == 'sysverb_cancel' || action == 'sysverb_delete' || action == 'sysverb_query')
	    return true;

	var formIsValid = true;
	var urlStructure = g_form.getValue('human_readable_url_structure');
	var delimiter = Math.floor(Math.random() * 100000);
	
	// Replaces all "-", "/" with a delimiter and % with delimiter + "%"
	var urlStrings = urlStructure.replaceAll(/[/-]/g, delimiter).replaceAll("%", delimiter+"%").split(delimiter);
	var variables = [];
	var nonVariables = [];

	for(var i=0; i<urlStrings.length; i++) {
		if(urlStrings[i].length > 1 && urlStrings[i].indexOf("%") == 0)
			variables.push(urlStrings[i]);
		else
			nonVariables.push(urlStrings[i]);
	}

	// Validation to allow only alpha-numeric, - and / characters
	var regEx = new RegExp('^[a-zA-Z0-9/-]*$');
	if(!regEx.test(nonVariables.join(""))){
		g_form.showFieldMsg("human_readable_url_structure", getMessage('Only alphanumeric characters, - and / are allowed.'), "error");
		formIsValid = false;
	}

	// Validation to allow only one "/" character.
	if(urlStructure.indexOf('/') != urlStructure.lastIndexOf('/')) {
		g_form.showFieldMsg("human_readable_url_structure", getMessage('No more than one "/" character is allowed.'), "error");
		formIsValid = false;
	}

	// human_readable_url_structure is already found to be not valid, do not do dynamic variable validation
	if (!formIsValid) {
		return false;
	}

	// human_readable_url_structure is valid, going-ahead to check for the existance of dynamic page variables.
	var actionName = g_form.getActionName();

	var ga = new GlideAjax('GetSpPageDynamicVariables');
	ga.addParam('sysparm_name','getVariables');
	ga.addParam('sysparm_page_sys_id',g_form.getUniqueValue());
	ga.getXMLAnswer(function (answer) {
		var existingVariables = JSON.parse(answer);
		var difference = variables.filter(function(s) {
			return !existingVariables.includes(s);
		});
		
		if(difference.length > 0) {
			var errorMessage = getMessage('Create dynamic page variable(s) before using them in the URL - {0}.');
			errorMessage = errorMessage.withValues([difference.join(", ")]);
			g_form.showFieldMsg("human_readable_url_structure", errorMessage, "error");
			formIsValid = false;
		}

		if (formIsValid) {
			g_scratchpad.isFormValid = true;
			// calling submit re-triggers the this client-script with true value for g_scratchpad.isFormValid.
			g_form.submit(actionName);
		}
	});

	// Makes form to wait till asynchronous validation completes
	return false;
}
