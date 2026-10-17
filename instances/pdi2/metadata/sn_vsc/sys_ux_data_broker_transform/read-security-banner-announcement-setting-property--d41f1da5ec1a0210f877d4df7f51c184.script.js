function transform(input) {
    return gs.getProperty("sn_vsc.configure_security_banner_announcements", "true") == "false"? false : true;
}
