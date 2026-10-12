/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const {
        NowDateTime
    } = imports["sn_uxf.core_libraries"]();
    let noImportantActionsSrMessage = await helpers.translate("No important actions.");

    api.setState('importantActionsLoading', true);
    api.setState("importantActions", []);
    let manualRefresh = event.elementId == "imp_actions_header_refresh" ? true : false
    helpers.snHttp('/api/sn_cmdb_ws/cmdb_workspace_api_scoped/imp_action_card',
        {
            method: 'POST',
            batch: true,
            body: {
                manualRefresh: manualRefresh
            }
        }
    ).then(async function({ response }) {
        if (!response || !response.result) {
            api.setState('importantActionsLoading', false);
            api.setState('importantActions', []);
            helpers.timing.setTimeout(() => {
                api.setState("srMessage", noImportantActionsSrMessage);
            }, 1000);
            return;
        }

        let cardResult = response?.result;
        let outputImportantActionConfigs = cardResult?.configs;
        let outputImportantActionTypes = cardResult?.impActionTypes;
        let lastRefreshedDateTime = cardResult?.lastRefreshedDateTime;
        let importantActions = [];

        if (!outputImportantActionConfigs || outputImportantActionConfigs.length == 0 || !outputImportantActionTypes) {
            api.setState('importantActionsLoading', false);
            api.setState('importantActions', []);
            api.setState('impActionsLastRefreshed', lastRefreshedDateTime);
            helpers.timing.setTimeout(() => {
                api.setState("srMessage", noImportantActionsSrMessage);
            }, 1000);
            return;
        }

        let stageActions = [];
        for (let record of cardResult.cards) {
            let cardObj = '';
            let {
                type,
                count,
                table_name,
                filter_conditions,
                list_columns,
                list_groupby,
                description,
                lastUpdatedHour
            } = record;

            let importantAction = outputImportantActionTypes[type.toUpperCase()];
            let lastUpdated = record.lastUpdatedHour >= 1 ? await helpers.translate("Updated {0}h ago", record.lastUpdatedHour) : await helpers.translate("Updated just now");
            cardObj = {
                title: {
                    label: importantAction.TITLE,
                    icon: importantAction.TITLE_ICON
                },
                isLoading: false,
                type: record.type,
                heading: {
                    label: importantAction.NAME
                },
                description: {
                    label: record.description,
                    lines: "3"
                },
                metaData: {
                    label: importantAction.METADATA_LABEL,
                    value: Number(record.count).toLocaleString()
                },
                lastUpdated: {
                    label: lastUpdated,
                    value: ""
                },
                button: {
                    label: importantAction.BUTTON_LABEL,
                    tooltip: importantAction.BUTTON_TOOLTIP
                },
                border: {
                    color: importantAction.BORDER_COLOR,
                    variant: "secondary"
                },
                navigation: {
                    route: "list",
                    fields: {
                        table: record.table_name
                    },
                    params : {
                        listTitle: importantAction.NAME,
                        fixedFilter: record.filter_conditions,
                        maxRows: "20",
                        columns: record.list_columns,
                        groupBy : record.list_groupby,
                        hideActions: !record.has_list_actions
                    },
                    title: importantAction.NAME
                }
            };
            if(importantAction.ID == 'de_duplication_tasks') {
                cardObj.navigation = {
                            route:  'deduplication-dashboard',
                            targetRoute: 'current'
                     };
            }
            stageActions.push(cardObj);
        }
        if (stageActions.length <= 0) {
            helpers.timing.setTimeout(() => {
                api.setState("srMessage", noImportantActionsSrMessage);
            }, 1000);
        }
        api.setState('importantActions', stageActions);
        api.setState('impActionsLastRefreshed', lastRefreshedDateTime);
        api.setState('importantActionsLoading', false);
    });
}
