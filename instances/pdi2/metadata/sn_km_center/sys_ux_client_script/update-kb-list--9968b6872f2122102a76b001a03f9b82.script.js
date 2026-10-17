/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function evaluateProperty({ api, event, imports, helpers }) {
    const { filterAndMapList } = imports["sn_km_center.filterAndMapListUtil"]();
    if (
        api.data.contributable_knowledge_bases &&
        api.data.contributable_knowledge_bases.output &&
        api.data.contributable_knowledge_bases.output.data
    ) {
        var knowledgeBases = api.data.contributable_knowledge_bases.output.data.schema["function"];
        let filteredKnowledgeBases = [];
        const filterString = event.payload.fieldValue ? event.payload.fieldValue : "";
        filteredKnowledgeBases = filterAndMapList(knowledgeBases, filterString);
        api.setState("kbList", filteredKnowledgeBases);
    } 
}
