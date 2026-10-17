(function() {
    var modelGr = new GlideRecord('sys_nlu_model');
    modelGr.addNullQuery('threshold_type');
    modelGr.addQuery('oob', false);
    modelGr.setValue('threshold_type', 'automatic');
    modelGr.updateMultiple();
})();
