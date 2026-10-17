function script({api, event, helpers, imports}) {
    const PortalAppShellUtils = imports["app_shell_portal.PortalAppShellUtils"]();
    PortalAppShellUtils.dataFetchSuccess(api, event, helpers, imports);
}
