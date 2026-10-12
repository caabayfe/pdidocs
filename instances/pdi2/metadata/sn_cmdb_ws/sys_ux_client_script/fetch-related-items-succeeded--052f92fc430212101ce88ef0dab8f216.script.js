/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    let available = event.payload?.data?.output?.result?.available;
    let whitelist = event.payload?.data?.output?.result?.whitelist;
    let allRelatedItems = {...available,...whitelist};
    
    // Remove '->' from name
    Object.keys(allRelatedItems).forEach((i) => {
        let x = allRelatedItems[i].indexOf("->");
        if(x != -1)
            allRelatedItems[i] = allRelatedItems[i].substring(0, x-1);
    });
    api.setState("allRelatedItems", allRelatedItems);

    const {
        templateId, taskId
    } = api.context.props;
    const { testSelectedTaskId } = api.state;
api.data.de_duplication_template_preview.execute({
        taskId : testSelectedTaskId || taskId,
templateSysId: templateId
    });
}
