/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    
    let interactionIndex = api.context.props.relatedLists.findIndex(relatedListItem => 
        relatedListItem.value.indexOf(api.state.usersInteractionRelatedListItemSysId) !== -1
    );
    api.setState('relatedListItemIndex', interactionIndex);

    let assetIndex = api.context.props.relatedLists.findIndex(relatedListItem => 
        relatedListItem.value.indexOf('e32c8b0353602110ad0fddeeff7b12ef') !== -1
    );
    api.setState('assetsRelatedListItemIndex', assetIndex);
}
