(function executeRule(current, previous /*null when async*/) {
    var gr = new GlideRecord("sn_dt_provider_exclusion_pattern");
    gr.addQuery("translator_configuration", current.translator_configuration);
    gr.addQuery('sys_id', '!=', current.sys_id);
    gr.query();
    if (gr.next()) {
        gs.addErrorMessage(gs.getMessage("Exclusion provider pattern with the translator configuration '{0}' already exists.", [GlideStringUtil.escapeHTML(current.translator_configuration.getDisplayValue())]));
        current.setAbortAction(true);
    }
})(current, previous);
