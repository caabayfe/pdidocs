/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var secondaryItems = api?.data?.glide_form_1?.nowRecordCommonHeader?.secondaryItems;
    if (!secondaryItems || secondaryItems.length == 0) {
        return '[{"label":"","value":""}]';
    }
    for (var i = 0; i < secondaryItems.length; i++) {
        if (secondaryItems[i].fieldName == 'security_check_category') {
            secondaryItems[i].type = 'simple';
        }
    }

    return secondaryItems;
}
