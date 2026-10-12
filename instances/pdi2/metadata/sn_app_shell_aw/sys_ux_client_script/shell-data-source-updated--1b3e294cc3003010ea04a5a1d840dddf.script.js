function script({ api, event, helpers, imports }) {
    const BreadcrumbUtils = imports["sn_app_shell_aw.BreadcrumbAppshellUtils"]();
    BreadcrumbUtils.appShellDataSourceUpdated(api, event, helpers, imports);
}
