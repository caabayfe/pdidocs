(function executeRule(current, previous /*null when async*/) {
    if(current.value != previous.value && sn_i18n.LanguageValidator.validateId(current.value)) {
        var gr = new GlideRecord('sys_user');
        if(gr.get(current.user)){
            gr.setValue('preferred_language', current.value);
            gr.setWorkflow(false);
            gr.update();
        }
    }
})(current, previous);
