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
    var data = api.data.fetch_response_templates_for_sow_1.output;
    var processedData = {};
    var titles = [];
    
    for (var i = 0; i < data.length; i++) {
        var temp = {};
        var sysId = data[i].sys_id;
        temp.name = data[i].name;
        temp.body = data[i].evaluated_response.evaluated_body;
        processedData[sysId] = temp; 
        var currentTitle = {};
        currentTitle.id = sysId;
        currentTitle.label = data[i].name;
        titles.push(currentTitle);
    }
    api.setState('titles', titles);
    api.setState('responses', processedData);
}
