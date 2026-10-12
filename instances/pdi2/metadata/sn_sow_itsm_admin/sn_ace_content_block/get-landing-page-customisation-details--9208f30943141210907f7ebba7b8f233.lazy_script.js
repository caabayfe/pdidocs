(function(context, pageParams, blockcontext) {
    var sowLandingPageUpgradeUtil = new sn_sow_itsm_common.SOWLandingPageUpgradeUtil();
    var areTier1DonutsCustomized = sowLandingPageUpgradeUtil.isRecordCustomised(sowLandingPageUpgradeUtil.TABLES.SYS_UX_CLIENT_SCRIPT_INCLUDE, sowLandingPageUpgradeUtil.TIER_1.clientScriptInclude);
    var areTier2DonutsCustomized = sowLandingPageUpgradeUtil.isRecordCustomised(sowLandingPageUpgradeUtil.TABLES.SYS_UX_CLIENT_SCRIPT_INCLUDE, sowLandingPageUpgradeUtil.TIER_2.clientScriptInclude);

    return {
        areTier1DonutsCustomized: areTier1DonutsCustomized,
        areTier2DonutsCustomized: areTier2DonutsCustomized
    };
})(context, pageParams, blockcontext);
