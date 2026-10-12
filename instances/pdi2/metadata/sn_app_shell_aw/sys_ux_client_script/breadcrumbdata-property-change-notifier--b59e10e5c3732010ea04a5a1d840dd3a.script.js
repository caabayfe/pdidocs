/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api, event, helpers, imports}) {
    var utils = imports["sn_app_shell_aw.BreadcrumbAppshellUtils"]();
    utils.breadcrumbPropertyChanged(api, event, helpers, imports);
}
