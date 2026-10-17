(function executeRule(current, previous /*null when async*/ ) {
    // checks if an indicator is already configured for the given skill
    // displays a popup that only the indicator with lowest order will be displayed
    var indicatorGr = new GlideRecord("sys_gen_ai_feedback_indicator");
    indicatorGr.addQuery("feedback_config", current.getValue("feedback_config"));
    indicatorGr.addQuery("feedback_type", current.getValue("feedback_type"));
    indicatorGr.query();
    if (indicatorGr.getRowCount() > 1) {
        gs.addErrorMessage(gs.getMessage("Multiple indicators configured for '{0}'. Only the indicator with lowest order will be shown.", current.getDisplayValue("feedback_config")));
    }
})(current, previous);
