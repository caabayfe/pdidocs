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
    var filters = api.data.fetch_filter_array_1.output.genAIFilters;
    var availableTab = [{
        label: await helpers.translate("Available for you"),
        count: filters.length
    }];
    var rows = api.data.fetch_filter_array_1?.output?.rowPayload || [];
    api.data.nowassistadminuser_1.output && (rows.forEach(row=> row.excludedActions = ["edit", "deactivate"]));
    
    var activeTab = [{
        label: await helpers.translate("Active"),
        count: api.data.fetch_filter_array_1.output.activeGenAIFiltersCount
    }];
    api.setState("activeTab", activeTab);
    api.setState("availableTab", availableTab);
    api.setState('filters', filters);
    api.setState('columnDefinitions', api.data.fetch_filter_array_1.output.columnDefinitions);
    api.setState('rowPayload', api.data.fetch_filter_array_1.output.rowPayload);
    var isEnabledRowDefinitions = {
        "customCellEmittedActions": ["NOW_TEXT_LINK#CLICKED"],
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
                    "id": "deactivate",
                    "icon": "",
                    "label": await helpers.translate("Deactivate"),
                    "action": "DEACTIVATE_ACTION"
                },

            ]
        },
        "rows": rows
    };
    api.setState('isEnabledRowDefinitions', isEnabledRowDefinitions);
    api.setState('faqHeader1', {
        "label": await helpers.translate("What are sample phrases and why are they important?"),
        "size": "md",
        "variant": "primary",
        "weight": "normal"
    });
    api.setState('faqHeader2', {
        "label": await helpers.translate("How many sample phrases should I provide for each filter?"),
        "size": "md",
        "variant": "primary",
        "weight": "normal"
    });
    api.setState('faqHeader3', {
        "label": await helpers.translate("Can I deactivate a filter once it is configured?"),
        "size": "md",
        "variant": "primary",
        "weight": "normal"
    });
    api.setState('faqHeader4', {
        "label": await helpers.translate("What if my filter is not detecting sensitive text as expected?"),
        "size": "md",
        "variant": "primary",
        "weight": "normal"
    });
    api.setState('pageLoading', false);

}
