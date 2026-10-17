(function executeRule(current, previous /*null when async*/ ) {
    var tableName = current.getValue("source");
    var fieldName = current.getValue("field");
    var values = current.getValue("value"); // valid values e.g. names,active

    var isValid = new sn_ais.AisUtil().isValidDotWalkName(tableName, fieldName, values);
    if (!isValid) {
        gs.addErrorMessage(gs.getMessage("dot-walk value(s): {0} is not valid", GlideStringUtil.escapeHTML(values)));
        current.setAbortAction(true);
    }
})(current, previous);
