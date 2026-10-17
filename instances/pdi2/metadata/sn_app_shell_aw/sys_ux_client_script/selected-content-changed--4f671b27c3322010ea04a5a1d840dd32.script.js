/**
 *
 * @param {{api: import("..").BreadCrumbAPI, event: import("..").BreadcrumbSelectedContentChanged, helpers: any, imports: any}} param0
 */
function selectedConentChanged({ api, event, helpers, imports }) {
    /**
     * @type {import("..").BreadcrumbUtils}
     */
    const BreadcrumbUtils = imports["sn_app_shell_aw.BreadcrumbAppshellUtils"]();
    BreadcrumbUtils.selectedContentChanged(api, event, helpers, imports);
}
