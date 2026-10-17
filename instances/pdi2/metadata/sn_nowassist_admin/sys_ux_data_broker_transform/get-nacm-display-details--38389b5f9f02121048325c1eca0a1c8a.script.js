function transform(input) {
    try {
        var util = new sn_nowassist_admin.SkillBuilderNaaUtils();
        var nacmDetails = util.getNacmDetailsForSkillConfig(input?.skillConfigId);
        var nacmDescription = sn_i18n.Message.getMessage("sn_nowassist_admin", "Show {skill_name} in Now Assist context menu.", {
            skill_name: nacmDetails?.skill_name
        });
        return {
            nacmDescription: nacmDescription,
            activeRecords: nacmDetails?.activeRecords,
            inactiveRecords: nacmDetails?.inactiveRecords
        };
    } catch (error) {
        gs.error("Error occurred in Get NACM display details data broker :" + error.toString());
    }
}
