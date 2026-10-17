/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    var selectedPrivacyPolicySysId = event?.context?.item?.value?.sysId;
    var privacyPolicyDetails = api?.state?.dataPrivacyChannels?.find(item => item.sysId === selectedPrivacyPolicySysId);
    api.setState("selectedPrivacyPolicy", privacyPolicyDetails);

    var rows = [];
    for (let dataPattern of privacyPolicyDetails?.dataPatterns) {
        rows.push({
            "key": dataPattern?.sysId,
            "cells": {
                "patterns": {
                    "value": dataPattern?.name
                },
                "status": {
                    "componentProps": {
                        "color": dataPattern.status ? 'positive' : 'gray',
                        "label": dataPattern.status ? await helpers.translate("Active") : await helpers.translate("Inactive"),
                        "variant": "tertiary",
                        "icon": ""
                    }
                },
                "anonymization_technique": {
                    "value": dataPattern?.technique
                }
            }
        });
    }
    var activeRowsDef = {
        "selectionEnabled": false,
        "rows": rows
    };
    api.setState('activeRowsDef', activeRowsDef);
    helpers.modal.open('view_details_modal');
}
