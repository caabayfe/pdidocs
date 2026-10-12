/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let params;
    const { payload } = event.payload;
    const { payload: { selectedTabIndex }} = event;
    const {
        ciClass,
        type,
        cloudProvider
    } = api.context.props;
    
    api.setState("selectedTabIndex", selectedTabIndex);
    if (selectedTabIndex == 0) {
        if (api.state.ciClassesChartParams) {
            params = api.state.ciClassesChartParams;
        }
    } else if(selectedTabIndex == 1) {
        if (api.state.cloudServicesChartParams) {
            params = api.state.cloudServicesChartParams;
        }
    }
    
    if (params) {
        api.emit('CONTENT_UPDATED', {
            params
        });
    } else {

        // Setting the state of first tab on first load
        params = {
            ciClass: ciClass,
            type: type,
            cloudProvider: null
        };
        api.setState("ciClassesChartParams", params);

        api.data.get_cloud_and_noncloud_assets_data.refresh();
    }
}
     
    

    
