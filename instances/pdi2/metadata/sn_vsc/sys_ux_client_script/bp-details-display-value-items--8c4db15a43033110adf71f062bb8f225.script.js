/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var transformedSecondaryItems = api?.data?.bp_details_form?.form?.header?.transformedSecondaryItems;
    if (!transformedSecondaryItems || transformedSecondaryItems.length == 0) {
        return '[{"label":"","value":""}]';
    }
    for (var i = 0; i < transformedSecondaryItems.length; i++) {
        if (transformedSecondaryItems[i].label == 'Security and privacy capabilities') {
            transformedSecondaryItems[i].label = 'Capability';
        }
    }
    return transformedSecondaryItems;
}
