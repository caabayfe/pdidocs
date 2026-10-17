/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    if(!api.state.showZeroCountCard) {
        api.setState('assetEventData', api.state.assetEventDataComplete.filter(function(card) {return card.count != 0;}));
    } else {
        api.setState('assetEventData', api.state.assetEventDataComplete);
    }
    api.setState('showZeroCountCard', !api.state.showZeroCountCard);
}
