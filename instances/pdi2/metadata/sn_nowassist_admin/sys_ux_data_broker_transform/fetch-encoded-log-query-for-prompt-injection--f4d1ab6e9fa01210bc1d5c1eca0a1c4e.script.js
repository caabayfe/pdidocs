function transform() {
    try {
        var guardUtil = new sn_nowassist_admin.NowAssistAdminGuardrails();
        var url = guardUtil.getExportURL([], guardUtil.PROMPT_INJECTION_METRIC_NAME);
        return {
            path: url
        };
    } catch (error) {
        gs.error("Error occurred in fetching encoded log query for Prompt Injection data broker : " + error.toString());
    }
}
