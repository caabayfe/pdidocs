/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var repeaterArr = [...api.state.repeaterArr];
    var idx = event.context.item.index;
    if (idx < repeaterArr.length) 
    repeaterArr[idx].minimizedText = !repeaterArr[idx].minimizedText;
    api.setState('repeaterArr', repeaterArr);
}
