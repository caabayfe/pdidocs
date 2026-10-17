function transform(input) {
    try {
        var nowAssistGuardianFilterUtil = new sn_nowassist_admin.NowAssistGuardianFilterUtil();
        var rowDetails = [];
        var columnDefinitions = {};
        var inactiveFilters = [];
        var genAIFilters = [];
        genAIFilters = nowAssistGuardianFilterUtil.getGenAIFilters();
        var activeGenAIFiltersCount = 0;

        for (let i = 0; i < genAIFilters.length; i++) {
            if (genAIFilters[i].isActive) {
                activeGenAIFiltersCount = activeGenAIFiltersCount + 1;
                var status = genAIFilters[i].isActive;
                var name = genAIFilters[i].name;
				var product = genAIFilters[i].product;
                var priorityOrder = genAIFilters[i].filterGroupOrder;
                var filterCategories = genAIFilters[i].filterGroup;
                var filterId = genAIFilters[i].filterId;
                var lastUpdatedOn = genAIFilters[i].lastUpdatedOn;

                var rowPayload = {
                    "key": filterId,
                    "cells": {
                        "status": {
                            "componentProps": {
                                "color": 'positive',
                                "label": "Active",
                                "variant": "tertiary",
                                "icon": "presence-fill"
                            }
                        },
                        "name": {
                            "value": name,
                        },
						"product":{
							"value": product,
						},
                        "priorityOrder": {
                            "value": priorityOrder,
                        },
                        "filterCategories": {
                            "value": filterCategories,
                        },
                        "lastUpdatedOn": {
                            "value": lastUpdatedOn
                        }
                    }
                };

                rowDetails.push(rowPayload);

            } else {
                inactiveFilters.push(genAIFilters[i]);
            }
        }


        columnDefinitions = {

            "columns": [{
                    "cellEditingDisabled": true,
                    "key": "status",
                    "componentTag": "now-highlighted-value",
                    "label": sn_i18n.Message.getMessage("sn_nowassist_admin", "Status"),
                    "type": "custom"
                }, {
                    "cellEditingDisabled": true,
                    "key": "name",
                    "label": sn_i18n.Message.getMessage("sn_nowassist_admin", "Name"),
                    "type": "string"
                },
				{
                    "cellEditingDisabled": true,
                    "key": "product",
                    "label": sn_i18n.Message.getMessage("sn_nowassist_admin", "Product"),
                    "type": "string"
                },
                {
                    "cellEditingDisabled": true,
                    "key": "priorityOrder",
                    "label": sn_i18n.Message.getMessage("sn_nowassist_admin", "Priority order"),
                    "type": "string"
                },
                {
                    "cellEditingDisabled": true,
                    "key": "filterCategories",
                    "label": sn_i18n.Message.getMessage("sn_nowassist_admin", "Filter categories"),
                    "type": "string"
                },
                {
                    "cellEditingDisabled": true,
                    "key": "lastUpdatedOn",
                    "label": sn_i18n.Message.getMessage("sn_nowassist_admin", "Last updated on"),
                    "type": "date"

                }
            ]
        };

        return {
            rowPayload: rowDetails,
            columnDefinitions: columnDefinitions,
            activeGenAIFiltersCount: activeGenAIFiltersCount,
            genAIFilters: inactiveFilters
        };
    } catch (e) {
        gs.error("Failed fetch  Filter - " + e.toString());
        return null;
    }
}
