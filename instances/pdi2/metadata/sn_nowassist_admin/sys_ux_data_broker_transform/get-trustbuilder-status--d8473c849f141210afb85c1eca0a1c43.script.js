function transform() {
    try {
        var guardUtil = new sn_nowassist_admin.NowAssistAdminGuardrails();
        return guardUtil.isTrustBuilderEnabled();

    } catch (error) {
        gs.error("Error in getting Trust Builder status data broker :" + error.toString());
    }
}
