(function executeRule(current, previous /*null when async*/ ) {

    var contextInputGr = new GlideRecord(Constants.TBL_CONTEXT_INPUT);
    contextInputGr.addQuery(Constants.COL_MODEL, current.getUniqueValue());
    contextInputGr.addQuery(Constants.COL_ELEMENT, 'context_table');
    contextInputGr.query();
    if (contextInputGr.next()) {
        if (current.getValue(Constants.COL_CONTEXT) != contextInputGr.getValue(Constants.COL_REFERENCE)) {
            contextInputGr.setValue(Constants.COL_REFERENCE, current.getValue(Constants.COL_CONTEXT));
            contextInputGr.setValue(Constants.COL_LABEL, new GlideRecord(current.context).getClassDisplayValue());
            contextInputGr.update();
        }
    }


})(current, previous);
