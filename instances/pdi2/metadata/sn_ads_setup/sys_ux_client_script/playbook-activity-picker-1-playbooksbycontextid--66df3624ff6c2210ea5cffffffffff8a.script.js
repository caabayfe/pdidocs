/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const db = api.data.playbook_custom_layout;
    var playbooksByContextId = db && db.playbooksByContextId || {};
    var contextIds = db && db.playbookContextIdsInOrder || [];

    if (contextIds.length === 0 || Object.keys(playbooksByContextId).length === 0) return {};
    var latestContext = contextIds[contextIds.length - 1];
    return {
        [latestContext]: playbooksByContextId[latestContext]
    };
}
