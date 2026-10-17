/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const {
        touchPointRecommendations,
        touchPoints,
        touchPointsStatus
    } = api.state;
    const currentEntity = api.item.value;
    const items = [];
    const { touchPointEnabled, parentId, touchPointFields, idleTimeEnabled } = currentEntity;
    const defaultPlaceholder = '-';
    if (!parentId) {
        const metrics = [];
        if (idleTimeEnabled) {
            metrics.push(helpers.translateSync("Idle time"));
        }
        if (touchPointEnabled) {
            metrics.push(helpers.translateSync("Touchpoints"));
        }
        items.push({
            label: helpers.translateSync('Metrics'),
            value: {
                type: 'string',
                value: metrics.length > 0 ? metrics.join(', ') : defaultPlaceholder,
            },
        });
    }
    const emptyPlaceHolderItem = {
        label: '',
        value: {
            type: 'string',
            value: '',
        },
    };

    return [emptyPlaceHolderItem, ...items, emptyPlaceHolderItem, emptyPlaceHolderItem];
}
