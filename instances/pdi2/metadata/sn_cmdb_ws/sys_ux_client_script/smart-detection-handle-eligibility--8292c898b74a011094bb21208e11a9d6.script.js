/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        getDecimalNumberWithGivenScale
    } = imports["sn_cmdb_ws.cmdbWSAttestationUtil"]();

    if (api.data.check_smart_detection_eligibility.output) {
        const {
            smartDetectionDisabled,
            smartDetectionEligible,
            activateSmartDetection,
            ciCount,
            lastDiscovered,
            smartDetectionFilter,
            smartDetectionAccepted,
            runOn,
            hidePopupUserPref
        } = api.data.check_smart_detection_eligibility.output;
        api.setState('smartDetectionFilter', smartDetectionFilter);
        api.setState('hidePopupUserPref', hidePopupUserPref);
        if (smartDetectionDisabled) {
            api.setState('smartDetectionAccepted', false);
            api.setState('smartDetectionCancelled', false);
            api.setState('smartDetectionUnavailable', false);
            api.setState('smartDetectionDisabled', true);
        } else if (!smartDetectionEligible) {
            api.setState('smartDetectionAccepted', false);
            api.setState('smartDetectionCancelled', false);
            api.setState('smartDetectionDisabled', false);
            api.setState('smartDetectionUnavailable', true);
        } else {
            api.setState('smartDetectionDisabled', false);
            api.setState('smartDetectionUnavailable', false);
            api.setState('smartDetectionRunOn', runOn);
            api.setState('smartDetectionLastDiscovered', lastDiscovered);
            api.setState('smartDetectionCount', ciCount);
            let smartDetectionPercentage = 0;
            const smartDetectionCount = api.state.smartDetectionCount;
            const totalCICount = api.state.totalCiCount;
            if (totalCICount > 0 && smartDetectionCount > 0) {
                smartDetectionPercentage = parseFloat((smartDetectionCount / totalCICount) * 100);
            }
            // Show upto 2 decimal points
            const smartDetectionPercentageStr = getDecimalNumberWithGivenScale(smartDetectionPercentage.toString(), 3);
            api.setState('smartDetectionPercentage', smartDetectionPercentageStr);

            if (activateSmartDetection) {
                if (ciCount > 0) {
                    helpers.modal.open('smart_detection_review', {
                        bare: true
                    });
                } else {
                    api.setState('smartDetectionAccepted', false);
                    api.setState('smartDetectionCancelled', false);
                }
            } else {
                api.setState('smartDetectionAccepted', smartDetectionAccepted);
                api.setState('smartDetectionCancelled', !smartDetectionAccepted);
            }
        }
    }
}
