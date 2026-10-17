/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    var count = 0;
    var contentTree = api.state.contentTree;
    for (const item of api.data.unsupported_intents_aggregation.output.data.GlideAggregate_Query) {
        count += item.count;
    }
    contentTree[2].children.push({"id": "Unsupported intents", "label": await helpers.translate("Unmapped intents ({0})", count)});
    api.setState('unmappedIntentsCount', api.data.unsupported_intents_aggregation.output.data.GlideAggregate_Query.length);
    api.setState('contentTree', contentTree);
}
