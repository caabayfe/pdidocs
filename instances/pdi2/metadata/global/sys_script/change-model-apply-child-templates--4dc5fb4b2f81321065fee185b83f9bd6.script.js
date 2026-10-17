(function executeRule(current, previous /*null when async*/ ) {
    new global.ChangeTemplate(current.getValue("chg_model_template")).applyChildTemplates(current);
})(current, previous);
