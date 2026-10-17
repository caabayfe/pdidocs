/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const homePageUtil = imports["sn_instance_clone.AdminCloneHomePageUiUtil"](api, helpers);
    var multiInstanceView = JSON.parse(JSON.stringify(api.state.multiInstanceView));
    if (event.elementId == 'pagination_control_step_2') {
        multiInstanceView.mifInstanceListPageNo = event.payload.value;    
    }

    homePageUtil.callUtilAPI({
        operation: "FETCH_MIF_INSTANCES",
        pageNo: multiInstanceView.mifInstanceListPageNo,
    }, true);

    api.setState('multiInstanceView', multiInstanceView);

}
