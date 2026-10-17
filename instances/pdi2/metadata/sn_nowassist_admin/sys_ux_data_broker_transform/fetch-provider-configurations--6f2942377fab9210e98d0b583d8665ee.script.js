function transform() {
    try {
        var naUtil = new sn_nowassist_admin.NowAssistSkillConfig();
		return naUtil.getProviderConfigurations();
    } catch (error) {
        gs.error("Error occurred while fetching provider configurations " + error.toString());
    }
}
