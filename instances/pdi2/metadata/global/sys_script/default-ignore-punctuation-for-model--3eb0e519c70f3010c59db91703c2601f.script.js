(function executeRule(current, previous /*null when async*/ ) {
    // Add your code here
    var parloIntegrator = new NLUParloIntegrator(current);
    var version = parloIntegrator.getModelVersion(parloIntegrator.getSolution());
    var capabilites = NLUParloIntegrator.getPunctuationAndThresholdCapabilities(current.getValue('language'), version) || {};
    if (typeof capabilites == 'object') {
        var update = false;
        if (capabilites.isIgnoreEnabled) {
            current.setValue("ignore_punctuation", capabilites.isIgnoreEnabled);
            update = true;
        }
        if (!isNaN(capabilites.modelThreshold)) {
            var dictGr = new GlideRecord('sys_dictionary');
            dictGr.addQuery('name', 'sys_nlu_model');
            dictGr.addQuery('element', 'confidence_threshold');
            dictGr.query();

            if (dictGr.next() && eval(dictGr.getValue("default_value")) == current.getValue("confidence_threshold")) {
                current.setValue("confidence_threshold", capabilites.modelThreshold);
                update = true;
            }
        }
        if (update) {
            current.update();
        }
    }

})(current, previous);
