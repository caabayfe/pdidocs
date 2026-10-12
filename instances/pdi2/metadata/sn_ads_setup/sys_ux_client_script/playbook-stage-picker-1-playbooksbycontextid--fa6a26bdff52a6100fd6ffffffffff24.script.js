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
    const playbooksByContextId = db && db.playbooksByContextId || {};
    const contextIds = db && db.playbookContextIdsInOrder || [];

    if (contextIds.length === 0 || Object.keys(playbooksByContextId).length === 0) return {};
    const latestContext = contextIds[contextIds.length - 1];
    return {
        [latestContext]: playbooksByContextId[latestContext]
    };
}
