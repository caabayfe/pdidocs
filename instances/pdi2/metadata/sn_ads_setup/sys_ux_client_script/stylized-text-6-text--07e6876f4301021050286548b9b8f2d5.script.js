/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const playbookResponse = api.data.playbook_data_broker_1;
    const playbookContextIdsInOrder = playbookResponse.playbookContextIdsInOrder;
    const selectedPlaybook = playbookContextIdsInOrder && playbookContextIdsInOrder.length && playbookContextIdsInOrder[0];
    if (selectedPlaybook) {
        const gsTitle = playbookResponse.playbooksByContextId[selectedPlaybook].title || '';
        return `You have successfully completed ${gsTitle} setup`;
    }
    return '';
}
