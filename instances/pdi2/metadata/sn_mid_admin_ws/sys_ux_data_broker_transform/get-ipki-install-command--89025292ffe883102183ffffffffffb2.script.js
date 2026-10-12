function transform(input) {
    var PACKAGE_BY_METHOD = { silent_windows: 'msi', silent_rpm: 'rpm', silent_deb: 'deb' };
    var packageType = PACKAGE_BY_METHOD[input.installType] || input.installType;
    return new sn_mid_admin_ws.MidSetupService().getIpkiInstallCommand(
        input.midName,
        input.midUserSysId,
        input.midRegKey,
        packageType,
        input.proxyHost,
        input.proxyPort,
        input.serviceName
    );
}
