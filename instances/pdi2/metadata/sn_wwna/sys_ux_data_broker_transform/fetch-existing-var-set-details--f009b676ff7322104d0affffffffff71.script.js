function transform(inputs) {
    let response = {
        columnDefinitions: {},
        rowDefinitionsGroupedByColumn: {}
    };
    try {
        const {
            tableName = '', configuredColumns = [], skillConfigId = ''
        } = inputs;

        if (!skillConfigId || !tableName || (!configuredColumns?.length)) {
            return response;
        }
        var utils = new sn_wwna.NAAWWNAUtils();
        var result = utils.getExistingVarSetByColumn(tableName, configuredColumns, [skillConfigId]) || {};

        response.columnDefinitions = {
            "columns": [{
                    "key": "skillConfigName",
                    "type": "string",
                    "label": sn_i18n.Message.getMessage("sn_wwna", "Skill Config"),
                    "renderAsLink": true
                },
                {
                    "key": "order",
                    "type": "string",
                    "label": sn_i18n.Message.getMessage("sn_wwna", "Order")
                },
                {
                    "key": "status",
                    "type": "custom",
					"componentTag": "now-highlighted-value",
                    "label": sn_i18n.Message.getMessage("sn_wwna", "Status"),
					"cellEditingDisabled": true
                }
            ]
        };
        let columns = Object.keys(result || {});
        columns.forEach((column) => {
            if (!response.rowDefinitionsGroupedByColumn[column]) {
                response.rowDefinitionsGroupedByColumn[column] = [];
            }
            result[column].forEach((skillConfig) => {
                response.rowDefinitionsGroupedByColumn[column].push({
                    "key": skillConfig.skillConfigId,
                    "cells": {
                        "skillConfigName": {
                            "value": skillConfig.skillConfigName
                        },
                        "order": {
                            "value": skillConfig.order
                        },
                        "status": {
                            "componentProps": {
                                "color": skillConfig.skillStateDetails['colour'],
                                "label": skillConfig.skillStateDetails['label'],
                                "variant": "tertiary",
                                "icon": "circle-fill",
								"size": "sm"
                            }
                        }
                    }
                });
            });
        });
		return response;
    } catch (err) {
        return response;
    }
}
