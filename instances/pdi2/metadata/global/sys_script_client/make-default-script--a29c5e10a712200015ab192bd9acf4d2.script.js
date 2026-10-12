function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue == '')
       return;

    if (typeof window !== 'undefined' && window && window.NOW && window.NOW.SyntaxEditor && window.NOW.SyntaxEditor.sanitizeVarName) {
        newValue = window.NOW.SyntaxEditor.sanitizeVarName(newValue);
    }

    // workaround for the fact that oldValue always comes in as the ORIGINAL value...
    if (typeof window !== 'undefined' && window)
        if (window._lastNameChangedTo)
            oldValue = window._lastNameChangedTo;
        window._lastNameChangedTo = newValue;

    var script = '' + g_form.getValue('script');

    // if there's already a script here, just fix the names...
    if (script)
        script = script.replace(new RegExp(oldValue, 'g'), newValue);

    // we had no script, so make a shell from scratch...
    else {
        script = '// Service APIs must be defined in the "Services" namespace - leave the "Services." prefix on the class name and prototype\n\n';
        script += 'Services.' + newValue + ' = Class.create();\n';
        script += 'Services.' + newValue + '.prototype = {\n';
        script += '    initialize: function() {\n';
        script += '        // Place any Service API initialization code here - runs each time an API is called on this Service\n\n';
        script += '    },\n\n';
        script += '    // Add Service APIs here as methods for this class\n\n';
        script += '    type: \'' + newValue + '\'\n';
        script += '}';
    }
    g_form.setValue('script', script);
}
