/**
 *
 * @param {{api: any, event: any, helpers: any, imports: any}} param0
 */
function reapplySubtoolbarOptions({ api, event, helpers, imports }) {
    /**
     * @type {import("..").BreadcrumbUtils}
     */
     const BreadcrumbUtils = imports["sn_app_shell_aw.BreadcrumbAppshellUtils"]();
     BreadcrumbUtils.reApplySubtoolbarOptions(api, event, helpers, imports);
}
