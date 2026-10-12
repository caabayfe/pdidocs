function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue == '')
       return;

    // workaround for the fact that oldValue always comes in as the ORIGINAL value...
    if (window._lastNameChangedTo)
        oldValue = window._lastNameChangedTo;
    window._lastNameChangedTo = newValue;

	var script = '' + g_form.getValue('script');
	var scopeName = g_scratchpad.scope;


    // if there's already a script here, just fix the names...
    if (script)
       script = script.replace(new RegExp(oldValue, 'g'), newValue);

    // we had no script, so make a shell from scratch...
	else if (scopeName && scopeName != 'global') {
      script = '// Replace "yourFunctionName" with an appropriate function name\n\n';
      script += '(function() {\n';
      script += '	return {\n';
      script += '		// Define your Workspace functions here\n';
      script += '		yourFunctionName: function() {\n\n';
      script += '			// Workspace code goes here \n\n';
      script += '		}\n';
      script += '	};\n';
      script += '})();\n\n';
      script += '// Define your core UI functions here\n';
      script += 'function yourFunctionName() {\n\n';
      script += '	// Core UI code goes here\n\n';
      script += '}';
    } else {
        script =  '';
	}
    g_form.setValue('script', script);
}
