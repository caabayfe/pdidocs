/**
 *
 * @param {{api: any, event: any, helpers: any, imports: any}} param0
 */
function script({ api, event, helpers, imports }) {
     const BreadcrumbUtils = imports["sn_app_shell_aw.BreadcrumbAppshellUtils"]();
     BreadcrumbUtils.userPreferenceSucceeded(api, event, helpers, imports);
}
