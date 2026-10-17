/**
 *
 * @param {{api: import("..").BreadCrumbAPI,
 *          event: import("..").ItemsFetchSuccess
 *          helpers: any, imports: any}} param0
 */
function dateResourceUpdated({ api, event, helpers, imports }) {
    const BreadcrumbUtils = imports["sn_app_shell_aw.BreadcrumbAppshellUtils"]();
    BreadcrumbUtils.handleSelectedContentChanged(api, event, helpers, imports);
}
