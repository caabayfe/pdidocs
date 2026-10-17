function transform() {
    try {
        var nacUtil = new sn_nowassist_admin.NowAssistConfig();
        nacUtil.enableNowAssistAndNAP();
    } catch (error) {
        gs.error("Error occurred while turning on NAP :" + error.toString());
    }
}
