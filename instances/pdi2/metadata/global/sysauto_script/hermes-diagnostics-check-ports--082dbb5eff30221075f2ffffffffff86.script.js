if (new sn_hermes.HermesUtil().isEnabled()) {
    try {
        //test external ports
        new sn_hermes.HermesUtil().testPorts(true);
    } catch (e) {
        gs.log("Hermes Diagnostics Check Ports: " + e.getMessage());
    }
}
