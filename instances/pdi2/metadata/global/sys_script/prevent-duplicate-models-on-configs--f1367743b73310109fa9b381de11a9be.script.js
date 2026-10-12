(function executeRule(current, previous /*null when async*/ ) {
    var gr = new GlideRecord('ais_genius_result_configuration_sys_nlu_model_m2m');
    gr.addQuery('genius_result_configuration', current.genius_result_configuration);
    gr.addQuery('nlu_model', current.nlu_model);
    gr.query();
    if (gr.next()) {
        gs.addErrorMessage(gs.getMessage('This NLU Model has already been linked to this Genius Result Configuration'));
        current.setAbortAction(true);
    }
})(current, previous);
