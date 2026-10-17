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

    var script = '' + g_form.getValue('example');
    var scope = '' + g_form.getValue('sys_scope');

    // if there's already a script here, just fix the names...
    if (script) {
        //Make sure there's an old value to replace or else it will replace every character
        //with the new value
        if(oldValue !== '')
            script = script.replace(new RegExp(oldValue, 'g'), newValue);
    } else {
        script =  'var ' + newValue + ' = Class.create();\n';
        script += newValue + '.prototype = {\n';
        script += '    initialize: function() {\n';
        script += '    },\n\n';
        script += '    process: function(/*array*/ data) {\n';
        script += '        data.push("new entry");\n';
        script += '        return data;\n';
        script += '    },\n\n';

        script += '    type: \'' + newValue + '\'\n';
        script += '};';		
    }
    g_form.setValue('example', script);
}
