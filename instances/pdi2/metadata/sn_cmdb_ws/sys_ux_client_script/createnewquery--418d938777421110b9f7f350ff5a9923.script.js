/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    let queryType = 1;
    if(event.elementId === "card_2")
        queryType = 2;
    if(event.elementId === "card_3")
        queryType = 3;

    helpers.navigate.to("multisource-query",{},{
        "queryType" : queryType,
        "cb" : Date.now()
    });

}
