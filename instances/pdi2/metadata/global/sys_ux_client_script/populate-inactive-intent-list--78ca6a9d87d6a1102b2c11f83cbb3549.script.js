/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    var intentTopicList = api.state.intentTopicList;
    var inactiveTopicCount = api.state.inactiveTopicCount;
    var contentTree = api.state.contentTree;
    var count = 0;
    var percent = 0;
    var inactiveTopicJSON = [{
        'label': await helpers.translate('Inactive Topic'),
        'status': 'warning' 
    }];
    var percentageJSON = [{
        'label': '',
        'status': 'positive'
    }];

    for (const intent of api.data.inactive_aggregation.output.data.GlideAggregate_Query) {
        if (intentTopicList[intent.groupBy[0].value] === 'false') {
            contentTree[1].children.push({"id": intent.groupBy[0].value, "label": await helpers.translate("{0} ({1})", intent.groupBy[0].value, intent.count), "highlightedValueProps": inactiveTopicJSON});
            inactiveTopicCount++;
        }
        else { 
            contentTree[1].children.push({"id": intent.groupBy[0].value, "label": await helpers.translate("{0} ({1})", intent.groupBy[0].value, intent.count)});
        }
        count += intent.count;
    }
    
    percent = count >= 0 ? Math.round((count / api.state.totalRecordCount) * 100) : 0;
    percentageJSON[0].label = String(percent) + "%";
    contentTree[1].label = await helpers.translate("Mapped intents - Inactive");
    contentTree[1].highlightedValueProps = percentageJSON;
    api.setState('matchingInactiveIntentCount', api.data.inactive_aggregation.output.data.GlideAggregate_Query.length);
    api.setState('contentTree', contentTree);
    api.setState('inactiveTopicCount', inactiveTopicCount);
    api.data.no_intents_aggregation.refresh();
}
