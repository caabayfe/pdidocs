function transform(input) {
    return new sn_mid_admin_ws.MidSetupService().migrateMids(input && input.midSysIds);
}
