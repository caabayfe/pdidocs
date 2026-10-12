/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { ciSysId } = api.context.props;
    if (event.payload.name === "ts") {
        api.setState('ciToRelCache', {});
        api.setState('ciSysId', ciSysId);
        api.setState('treeContents', {
            down: { items: null, expandedItems: null },
            up: { items: null, expandedItems: null },
            flat: { items: null, expandedItems: null }
        });
    }
}
