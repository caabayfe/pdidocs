(function() {
    if (pm.isZboot()) {
        return;
    }
    var gr = new GlideRecord('sys_dictionary');
        
    gr.addEncodedQuery('name=sys_nlu_intent^ORname=sys_nlu_model^ORname=sys_nlu_entity^element=confidence_threshold');
    gr.setValue('default_value', 'javascript:("0" + GlideLocale.get().getDecimalSeparator() + "6")');
    gr.updateMultiple();
    gs.info('NLU: Updated confidence_threshold default_value for sys_nlu_model table through fix script.');
    gs.info('NLU: Updated confidence_threshold default_value for sys_nlu_intent table through fix script.');
    gs.info('NLU: Updated confidence_threshold default_value for sys_nlu_entity table through fix script.');
})();
