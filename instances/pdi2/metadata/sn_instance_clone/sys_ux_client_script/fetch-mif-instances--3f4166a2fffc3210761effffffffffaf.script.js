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
    debugger;
    const homePageUtil = imports["sn_instance_clone.AdminCloneHomePageUiUtil"](api, helpers);
    var multiInstanceView = JSON.parse(JSON.stringify(api.state.multiInstanceView));
    if (event.elementId == 'pagination_control_step_2') {
        multiInstanceView.mifInstanceListPageNo = event.payload.value;
    }
    if (event.name === "NOW_INPUT#ENTER_KEYDOWN" || event.name === "NOW_BUTTON_ICONIC#CLICKED") {
        var searchTerm = event.payload.fieldValue || "";
        api.setState("searchTerm", searchTerm);
        multiInstanceView.mifInstanceListPageNo = 0;
    }
    if(event.elementId=='button_iconic_2'){
        homePageUtil.callUtilAPI({
        operation: "FETCH_MIF_INSTANCES",
        pageNo: multiInstanceView.mifInstanceListPageNo,
        searchinput:""
    }, true);
    } else{
    homePageUtil.callUtilAPI({
        operation: "FETCH_MIF_INSTANCES",
        pageNo: multiInstanceView.mifInstanceListPageNo,
        searchinput:api.state.searchTerm
    }, true);
    }
    api.setState('multiInstanceView', multiInstanceView);

}
