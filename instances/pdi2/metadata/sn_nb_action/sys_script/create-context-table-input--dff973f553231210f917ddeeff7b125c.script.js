(function executeRule(current, previous /*null when async*/ ) {
    var contextInputGr = new GlideRecord(Constants.TBL_CONTEXT_INPUT);
    contextInputGr.addQuery(Constants.COL_MODEL, current.getValue(Constants.COL_MODEL));
    contextInputGr.addQuery(Constants.COL_ELEMENT, 'context_table');
    contextInputGr.query();
    if (!contextInputGr.hasNext()) {
        var contextGr = new GlideRecord(Constants.TBL_RULE_CONTEXT);
        contextGr.get(current.getValue(Constants.COL_MODEL));
        contextGr.setValue(Constants.COL_INPUT_TABLE, Constants.VAR__M_SN_NB_ACTION_CONTEXT_INPUT_PREFIX + contextGr.sys_id);
        contextGr.update();
        var newContextInputGr = new GlideRecord(Constants.TBL_CONTEXT_INPUT);
        newContextInputGr.initialize();
        newContextInputGr.setValue(Constants.COL_LABEL, new GlideRecord(current.model.context).getClassDisplayValue());
        newContextInputGr.setValue(Constants.COL_ELEMENT, 'context_table');
        newContextInputGr.setValue(Constants.COL_INTERNAL_TYPE, 'reference');
        newContextInputGr.setValue(Constants.COL_REFERENCE, current.model.context);
        newContextInputGr.setValue(Constants.COL_MODEL, current.getValue(Constants.COL_MODEL));
        newContextInputGr.setValue(Constants.COL_MODEL_TABLE, 'sn_nb_action_rule_context');
        newContextInputGr.setValue(Constants.COL_MODEL_ID, current.getValue(Constants.COL_MODEL));
        newContextInputGr.insert();
    }


})(current, previous);
