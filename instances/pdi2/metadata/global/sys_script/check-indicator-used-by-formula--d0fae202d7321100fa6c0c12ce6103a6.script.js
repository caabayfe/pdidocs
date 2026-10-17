checkIndicatorUsedInFormula();

function checkIndicatorUsedInFormula() {
    var formula = new PAUtils().usedInFormulaIndicators(current.sys_id)
    if (formula !== false){
        gs.addErrorMessage(gs.getMessage("Unable to delete indicator because it is used by formula indicator '{0}'", formula));
        current.setAbortAction(true);
    }
}
