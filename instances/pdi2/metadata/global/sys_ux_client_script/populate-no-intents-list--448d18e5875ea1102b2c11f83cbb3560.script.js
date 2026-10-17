/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    var contentTree = api.state.contentTree;
    var noIntentCount = api.state.noIntentCount;
    var unsupportedIntentCount = api.state.unsupportedIntentCount;
    var totalCount = 0;
    var percentageJSON = [{
        'label': '',
        'status': 'positive'
    }];
    
    percentageJSON[0].label = (noIntentCount + unsupportedIntentCount) >= 0 ? String(Math.round((((noIntentCount + unsupportedIntentCount) / api.state.totalRecordCount) * 100))) + "%" : "0%";
    contentTree[2].label = await helpers.translate("Other");
    contentTree[2].highlightedValueProps = percentageJSON;

    //Ensure that the aggregation query has data to extract
    if (api.data.no_intents_aggregation.output.data.GlideAggregate_Query[0] !== undefined && api.data.no_intents_aggregation.output.data.GlideAggregate_Query[0] !== null) {
        totalCount = api.data.no_intents_aggregation.output.data.GlideAggregate_Query[0].count;
    }

    contentTree[2].children.push({"id": "No intents found", "label": await helpers.translate("No intents found ({0})", String(totalCount))});
    api.setState('contentTree', contentTree);
    api.data.unsupported_intents_aggregation.refresh();
}
