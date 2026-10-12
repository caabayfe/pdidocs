(function executeRule(current, previous /*null when async*/ ) {
    // gs.info("Validate Formula Syntax: start");

    var formula = new SNC.FormulaParserScriptable();
    var variableName = "";
    if (current.isNewRecord())
        variableName = "mapOfIndicators" + "_";
    else
        variableName = "mapOfIndicators" + "_" + current.sys_id;

    var mapOfIndicators = gs.getSession().getProperty(variableName);
    var sysIdFormula = "";
    try {
        var response = formula.getParsedFormula(JSON.stringify({
            formula: current.getValue("formula"),
            calendar: current.getValue("calendar")
        }), mapOfIndicators);
        sysIdFormula = JSON.parse(response).parsedFormula;
    } catch (ex) {
        gs.addErrorMessage(ex.message);
        current.setAbortAction(true);
    }

    current.formula = sysIdFormula;

})(current, previous);
