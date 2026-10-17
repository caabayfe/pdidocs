/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { actionSysId } = event.payload;
    let url;
    const sysClassName = api.data.explore_ci_get_ci_header_info.output.sysClassName;
    const viewName = api.context.props.view || "explore_ci";
    if (actionSysId == 'configure_resources') {
        url = `/slushbucket.do?sysparm_view=${viewName}&sysparm_list=${sysClassName}&sysparm_form=related_list`;
    } else if (actionSysId == 'configure_attributes') {
        url = `/now/build/form/main/params/table/${sysClassName}/view/${viewName}/page/views`;
    }
    if (url) {
        helpers.navigate.to(
            null,
            null,
            null,
            false,
            false,
            null, {
                url: url
            }
        );
    }

}
