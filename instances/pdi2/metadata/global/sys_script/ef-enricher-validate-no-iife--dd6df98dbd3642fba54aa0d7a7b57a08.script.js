(function executeRule(current, previous /*null when async*/) {
    var scriptValue = current.getValue('script');
    
    if (gs.nil(scriptValue)) {
        return;
    }
    
    // Check for IIFE patterns:
    // (function() { ... })();
    // (function(){ ... })();
    // (function () { ... })();
    // (function(params) { ... })(args);
    var iifePattern = /\(\s*function\s*\([^)]*\)\s*\{[\s\S]*\}\s*\)\s*\([^)]*\)/;
    
    if (iifePattern.test(scriptValue)) {
        gs.addErrorMessage(sn_i18n.getMessage('error_framework','Enricher scripts should not use IIFE (Immediately Invoked Function Expression) pattern. ' +
                          'The script executes in GlideScopedEvaluator which provides scope isolation. ' +
                          'Please remove the (function() { ... })(); wrapper.'));
        current.setAbortAction(true);
    }
})(current, previous);
