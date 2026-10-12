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
    var availableProducts = api?.data?.available_products_for_monitoring_offensiveness_1?.output?.availableProducts;
    api.setState('availableDataArray', availableProducts);
    var availableTab = [{
        label: await helpers.translate("Available for you"),
        count: availableProducts?.length
    }];

    var activeProducts = api?.data?.available_products_for_monitoring_offensiveness_1?.output?.activeProducts;
    var activeLabel = await helpers.translate("Active");
    var monitorLabel = await helpers.translate("Log only");
    var blockLabel = await helpers.translate("Block and log");
    var excludedActions = api.data.nowassistadminuser_1.output ? ["edit", "deactivate", "export"] : [];
    var rows = [];
    for (let product of activeProducts) {
        rows.push({
            "key": product?.id,
            "excludedActions": excludedActions,
            "cells": {
                "status": {
                    "componentProps": {
                        "color": "green",
                        "label": activeLabel,
                        "variant": "tertiary",
                        "icon": "circle-fill"
                    }
                },
                "isActive": {
                    "componentProps": {
                        "icon": product?.isActive ? "" : "exclamation-triangle-outline",
                        "bare": true,
                        "hidePadding": true,
                        "size": "lg",
                        "hidden" : product?.isActive ? true : false,
                        "tooltipContent": product?.isActive ? "" : await helpers.translate("You must activate at least one skill before Now Assist Guardrail can log or block offensive content")
                    }
                },
                "buProduct": {
                    "value": product?.name
                },
                "detectionImpact": {
                    "value": product?.controlSettingData?.detectionImpact === "MONITOR" ? monitorLabel : (product?.controlSettingData?.detectionImpact === "BLOCK" ? blockLabel : "")
                },
                "lastUpdatedBy": {
                    "value": product?.controlSettingData?.lastUpdatedBy
                },
                "lastUpdatedOn": {
                    "value": product?.controlSettingData?.lastUpdatedOn
                }
            }
        });
    }
    var activeRowsDef = {
        "selectionEnabled": false,
        "actions": {
            "position": "end",
            "numActionIcons": 0,
            "actionsItems": [{
                    "id": "edit",
                    "icon": "",
                    "label": await helpers.translate("Edit"),
                    "action": "EDIT_ACTION"
                },
                {
                    "id": "export",
                    "icon": "",
                    "label": await helpers.translate("Export"),
                    "action": "EXPORT_ACTION"
                },
                {
                    "id": "deactivate",
                    "icon": "",
                    "label": await helpers.translate("Deactivate"),
                    "action": "DEACTIVATE_ACTION"
                },

            ]
        },
        "rows": rows
    };
    api.setState('activeRowsDef', activeRowsDef);
    var activeTab = [{
        label: activeLabel,
        count: activeProducts?.length
    }];

    api.setState('availableTab', availableTab);
    api.setState('activeTab', activeTab);

    var columnDefinition = {
        "columns": [{
            "cellEditingDisabled": true,
            "componentTag": "now-highlighted-value",
            "key": "status",
            "label": await helpers.translate("Status"),
            "type": "custom"
        }, {
            "cellEditingDisabled": true,
            "componentTag": "now-button-iconic",
            "key": "isActive",
            "type": "custom"
        }, {
            "cellEditingDisabled": true,
            "key": "buProduct",
            "label": await helpers.translate("Product"),
            "type": "string"
        }, {
            "cellEditingDisabled": true,
            "key": "detectionImpact",
            "label": await helpers.translate("Detection Impact"),
            "type": "string"
        }, {
            "cellEditingDisabled": true,
            "key": "lastUpdatedBy",
            "label": await helpers.translate("Last updated by"),
            "type": "string"
        }, {
            "cellEditingDisabled": true,
            "key": "lastUpdatedOn",
            "label": await helpers.translate("Last updated on"),
            "type": "string"
        }]
    };
    api.setState('columnDefinition', columnDefinition);

    api.setState('faqHeader1', {
        "label": await helpers.translate("What does Now Assist Guardian's offensiveness protection protect against?"),
        "size": "md",
        "variant": "primary",
        "weight": "normal"
    });
    api.setState('faqHeader2', {
        "label": await helpers.translate("Why is offensiveness blocking not turned on by default?"),
        "size": "md",
        "variant": "primary",
        "weight": "normal"
    });
    api.setState('faqHeader3', {
        "label": await helpers.translate("Can I configure what counts as offensive content?"),
        "size": "md",
        "variant": "primary",
        "weight": "normal"
    });
}
