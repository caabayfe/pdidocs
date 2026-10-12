/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        getAlertObj
    } = imports["sn_access_analyzer.AccessanalyzerUIUtil"]();
    const NOTIFICATIONS_EVENT_NAME = "NOW_UXF_PAGE#ADD_NOTIFICATIONS";

    const isTimeLimitedRolePresent = api.data.time_limited_roles.results.length > 0;
    if (isTimeLimitedRolePresent) {
        helpers.translate("Time limited role assignments found for the user due to which the results may be impacted. You can review the time limited roles assigned for the user")
            .then( function(content) {
                api.emit(NOTIFICATIONS_EVENT_NAME, {
                    items: [getTimeLimitedRoleAlert(content, api.data.request_resource.result.user.value)]
                });
            });
    }

    function getTimeLimitedRoleAlert(content, userSysId) {
        const url = "nav_to.do?uri=sys_user_has_role_time_limited_list.do?sysparm_query=" + encodeURIComponent("user=" + userSysId);
        const textLink = {
            label: "here",
            href: url
        };
        return getAlertObj("time_limited_role_alert", content, textLink);
    }
}
