if (new sn_hermes.HermesUtil().isEnabled()) {
    try {
        //test ipki
        new sn_hermes.HermesUtil().getIPKIComponentStatus();
        //test send/receive for services
        new sn_hermes.HermesUtil().runServiceDiagnostics();
    } catch (e) {
        gs.log("Hermes Diagnostics Check: " + e.getMessage());
    }
}
