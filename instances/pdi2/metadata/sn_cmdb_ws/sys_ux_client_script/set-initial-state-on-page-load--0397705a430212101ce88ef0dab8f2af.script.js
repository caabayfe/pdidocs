/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        hidePreview,
        hideTaskSelection,
        taskId,
        isGenerativeAi
    } = api.context.props;
    if(taskId)
        api.setState("testSelectedTaskId", taskId);
    
    if(hidePreview && (hidePreview == true || hidePreview == 'true')){
        api.setState("defaultState_reviewTestResultsHidden", true);
    } else {
        api.setState("defaultState_reviewTestResultsHidden", false);
    }

    if(hideTaskSelection && (hideTaskSelection == true || hideTaskSelection == 'true')){
        api.setState("testTaskSelectionExpanded", true);
    } else {
        api.setState("testTaskSelectionExpanded", false);
    }

    if(isGenerativeAi && (isGenerativeAi == true || isGenerativeAi == 'true')){
        api.setState("isGenAI", true);
    } else {
        api.setState("isGenAI", false);
    }
}
