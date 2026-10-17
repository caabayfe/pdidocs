/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({ api, event, helpers, imports }) {
    const {
        getDecimalNumberWithGivenScale,
        SR_CONTROLLER_OUTPUT_FIELDS,
        getRelatedLists
    } = imports["sn_cmdb_ws.cmdbWSAttestationUtil"]();

    const {
        name: updatedField
    } = event.payload;

    // proceed if the related list data changed
    if (updatedField === SR_CONTROLLER_OUTPUT_FIELDS.RELATED_LIST) {
        const relatedLists = getRelatedLists(api.data.record);
        if (relatedLists) {
            // update total ci count
            const totalCICount = relatedLists
                .reduce((prevVal, currentElm) => prevVal + currentElm.count, 0);
            api.setState("totalCiCount", totalCICount);

            let smartDetectionPercentage = 0;
            const smartDetectionCount = api.state.smartDetectionCount;
            if (totalCICount > 0 && smartDetectionCount > 0) {
                smartDetectionPercentage = parseFloat((smartDetectionCount / totalCICount) * 100);
            }
            // update smart detection percentage upto 2 decimal points
            const smartDetectionPercentageStr = getDecimalNumberWithGivenScale(smartDetectionPercentage.toString(), 3);
            api.setState('smartDetectionPercentage', smartDetectionPercentageStr);
        }
    }
}
