/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if( api.state.projectData.ismining==false){
        return true;
    }
    if (api.state.projectData?.watchList?.length > 0 && api.state.projectData?.userId?.length > 0) {
        const data = api.state.projectData.watchList.find((id) => api.state.projectData.userId[0] == id);
        if(data || api.state.projectData.ismining==false){
            return true;
        }else{
            return false;
        }
    }
}
