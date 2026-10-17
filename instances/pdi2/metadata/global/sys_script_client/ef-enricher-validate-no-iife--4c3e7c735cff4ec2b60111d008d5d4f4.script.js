function onSubmit() {
    var scriptValue = g_form.getValue('script');
    
    if (!scriptValue) {
        return true;
    }
    
    // Check for IIFE patterns:
    // (function() { ... })();
    // (function(){ ... })();
    // (function () { ... })();
    // (function(params) { ... })(args);
    var iifePattern = /\(\s*function\s*\([^)]*\)\s*\{[\s\S]*\}\s*\)\s*\([^)]*\)/;
    
    if (iifePattern.test(scriptValue)) {
        g_form.addErrorMessage(getMessage('error_framework','Enricher scripts should not use IIFE (Immediately Invoked Function Expression) pattern. ' +
                              'The script executes in GlideScopedEvaluator which provides scope isolation. ' +
                              'Please remove the (function() { ... })(); wrapper.'));
        return false;
    }
    
    return true;
}
