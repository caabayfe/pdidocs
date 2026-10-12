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

    if (event.elementId == 'get_process_definition') {
        const processId = api.data.get_process_definition.results?.[0]?.sys_id?.value;
        api.setState('processConfigId', processId);

        if (processId) {
            api.data.process_configuration_automated_findings.refresh();
            api.data.process_configuration_rule_based_findings.refresh();

            if (api.state.addFromLibraryClicked) {
                helpers.modal.open("[component-id$='add_from_library']");
                api.data.list_controller_3.updateQuery({
                    encodedQuery: `process_def.sys_id=${processId}^active=true`
                });
                api.data.list_controller_4.updateQuery({
                    encodedQuery: `process_def.sys_id=${processId}^active=true`
                });
            }
        } else if (api.state.addFromLibraryClicked) {
            helpers.modal.open("[component-id$='library_not_available']");
        }

        api.setState('addFromLibraryClicked', false);
        return;
    }
    if (event.elementId == "add_from_lib" || event.elementId === 'rule_based_finding_list' || event.elementId === 'automated_finding_list') {
        const canManageLibrary = Boolean(api.state.projectPermissions?.promin_process_def?.canCreate);
        const noFindingsAdminMessage = await helpers.translate('No improvement opportunity definitions.');
        const noFindingsAnalystMessage = await helpers.translate('No improvement opportunity definitions. Please contact your administrator to manage the library.');

        if (api.state.tabindex == 0) {
            api.setState('templateTabIndex', 0);
        } else {
            api.setState('templateTabIndex', 1);
        }
        if (api.data.get_process_definition.results.length == 0) {
            api.setState('templateOverlayMessage', {
                type: 'message',
                showColumnHeaders: true,
                messageConfig: {
                    illustration: 'no-data',
                    heading: {
                        label: await helpers.translate('No process configuration available for {0} table. Please contact your admin/power user to create a process configuration or to manage findings in the library.', api.state.processDefQuery),
                        level: 5,
                    },
                },
            });
            api.setState('addFromLibraryClicked', true);
            api.data.get_process_definition.refresh();
            return;
        }
        if (api.data.process_configuration_automated_findings.results.length == 0 && api.data.process_configuration_rule_based_findings.results.length == 0) {
            api.setState('templateOverlayMessage', {
                type: 'message',
                showColumnHeaders: true,
                messageConfig: {
                    illustration: 'no-data',
                    "actions": canManageLibrary ? [{
                        "label": await helpers.translate('Manage library'),
                        "variant": "primary",
                        "disabled": false,
                        "clickActionType": "NOW_TEMPLATE_MESSAGE_EMPTY_STATE#ACTION_CLICKED"
                    }] : [],
                    heading: {
                        label: canManageLibrary ? noFindingsAdminMessage : noFindingsAnalystMessage,
                        level: 5,
                    },
                },
            });
            helpers.modal.open("[component-id$='add_from_library']");
            return;
        }
        api.data.list_controller_3.updateQuery({
            encodedQuery: `process_def.sys_id=${api.data.get_process_definition.results[0].sys_id.value}^active=true`
        });
        api.setState('templateOverlayMessage', {
            type: 'loader',
            showColumnHeaders: true,
            loaderConfig: {
                label: await helpers.translate('Loading...'),
                size: 'md',
            },
        });
        api.setState('ruleBasedIds', []);
        api.setState('automatedIds', []);
        const ruleBasedList = api.state.ruleBasedList.rows.map((data) => {
            return { ...data,
                'isSelected': false
            };
        });
        api.setState('ruleBasedList', {
            "rows": ruleBasedList
        });
        const automatedList = api.state.automatedList.rows.map((data) => {
            return { ...data,
                'isSelected': false
            };
        });
        api.setState('automatedList', {
            "rows": automatedList
        });
        helpers.modal.open("[component-id$='add_from_library']");
        return;
    }
    if (api.state.iscurrentView.landing && api.state.totalFindingsCount > 0) {
        api.setState('overlayMessage', {});
        api.setState('tabindex', 0);
        api.setState('listQuery', `project.sys_id=${api.state.projectId}^active=true`);
    } else if (api.state.iscurrentView.landing && api.state.totalFindingsCount == 0) {
        const {
            projectInfo: {
                isShared,
                permissions: {
                    promin_project,
                },
            },
        } = api.data.get_project_info.output.data.snPo.GlidePromin.getProjectInfo;

        api.setState('overlayMessage', {
            "type": "message",
            "showColumnHeaders": true,
            "messageConfig": {
                "actions": [{
                    "label": await helpers.translate("Add from library"),
                    "variant": "primary",
                    "disabled": isShared || !promin_project.canWrite,
                    "clickActionType": "NOW_TEMPLATE_MESSAGE_EMPTY_STATE#ACTION_CLICKED"
                }],
                "heading": {
                    "level": 1
                },
                "illustration": "add-data"
            }
        });
    }
}
