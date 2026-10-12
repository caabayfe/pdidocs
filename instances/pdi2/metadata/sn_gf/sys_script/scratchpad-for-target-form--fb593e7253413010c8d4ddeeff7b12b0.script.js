(function executeRule(current, previous /*null when async*/ ) {

    g_scratchpad.isWeightPropertyEnabled = gs.getProperty(GoalFrameworkConstants.WEIGHTED_AVERAGE_ENABLED);
    g_scratchpad.isGFAInstalled = GlidePluginManager.isActive('sn_gfa');
    g_scratchpad.unitOfMeasureChoiceList = sn_gf.GFUtil.getChoiceListForUnit(current.measure?.getRefRecord().getValue("choice_set"));
    g_scratchpad.recentQuantitativeType = (current.getValue("type") != "milestone") ? current.getValue("type") : "";

    var countUnitOfMeasureGr = new GlideRecord(sn_gf.GoalFrameworkConstants.TARGET_UNITS_TABLE);
    countUnitOfMeasureGr.get(sn_gf.GoalFrameworkConstants.TARGET_UNITS_COUNT_ID);
    g_scratchpad.countUnitOfMeasureId = countUnitOfMeasureGr.isValidRecord() ?
        sn_gf.GoalFrameworkConstants.TARGET_UNITS_COUNT_ID :
        "";

})(current, previous);
