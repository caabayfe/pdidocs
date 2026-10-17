function script({api, event, helpers, imports}) {
    const PortalAppShellUtils = imports["sn_app_shell_aw.PortalAppShellUtils"]();
    PortalAppShellUtils.dataFetchSuccess(api, event, helpers, imports);
}
