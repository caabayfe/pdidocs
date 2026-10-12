(function executeRule(current, previous /*null when async*/ ) {
    g_scratchpad.isKnowledgeCenterEnabled = gs.getProperty("sn_km_center.glide.knowman.enable", false) + "";
    g_scratchpad.isECERedirectionEnabled = gs.getProperty("sn_km_center.glide.knowman.ece.enable", false) + "";
})(current, previous);
