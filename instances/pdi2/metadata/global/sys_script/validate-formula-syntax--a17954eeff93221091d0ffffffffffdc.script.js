(function executeRule(current, previous /*null when async*/ ) {
    function saveInvalidFormulaValueInSession(sysId, value) {
        try {
            var session = gs.getSession();
            var invalidFormulaSessionKey = "pa_datasnapshot_invalid_formulas_" + sysId;
            if (session != null) {
                if (value == null) {
                    session.clearClientData(invalidFormulaSessionKey);
                } else {
                    session.putClientData(invalidFormulaSessionKey, value);
                }
            }
        } catch (ex) {
            gs.error("Exception while saving invalid formula : " + ex.message);
        }
    }

    function clearInvalidFormulaInSession(sysId) {
        saveInvalidFormulaValueInSession(sysId, null);
    }

    var formula = new SNC.FormulaParserScriptable();
    var variableName = "";
    if (current.isNewRecord())
        variableName = "mapOfIndicators" + "_";
    else
        variableName = "mapOfIndicators" + "_" + current.sys_id;

    var mapOfIndicators = gs.getSession().getProperty(variableName);
    var sysIdFormula = "";
    var recordSysId = current.isNewRecord() ? -1 : current.getUniqueValue();
    try {
        var response = formula.getParsedFormula(JSON.stringify({
            formula: current.getValue("formula"),
            calendar: current.getValue("calendar")
        }), mapOfIndicators);
        sysIdFormula = JSON.parse(response).parsedFormula;
        // clear the invalid formula
        clearInvalidFormulaInSession(recordSysId);
    } catch (ex) {
        gs.addErrorMessage(ex.message);
        // save the formula if invalid
        saveInvalidFormulaValueInSession(recordSysId, current.getValue('formula'));
        current.setAbortAction(true);
    }
    current.formula = sysIdFormula;
})(current, previous);
