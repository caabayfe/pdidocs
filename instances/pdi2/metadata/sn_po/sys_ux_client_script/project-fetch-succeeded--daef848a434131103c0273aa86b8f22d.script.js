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
    const project = api.data.get_current_project.result;
    const watchListUsers = project.watch_list;
    if (!watchListUsers.value) {
        api.setState('selectedWatchlistUsers', []);
    } else {
        const watchListUserSysIds = watchListUsers.value.split(',');
        const watchListUserDisplayValues = watchListUsers.displayValue.split(',');

        const selectedWatchlistUsers = [];
        for (let i = 0; i < watchListUserSysIds.length; i += 1) {
            selectedWatchlistUsers.push({
                id: watchListUserSysIds[i],
                label: watchListUserDisplayValues[i]
            });
        }
        api.setState('selectedWatchlistUsers', selectedWatchlistUsers);
    }

    // Set project name in workspace tab title
    if (project.name && project.name.value) {
        helpers.screen.updateStatus({
            title: await helpers.translate('{0} | Review and mine', project.name.value),
        });
    }

    let objectivesLabelValueStack = [...api.state.objectivesLabelValueStack];
    objectivesLabelValueStack = [{
            id: 'Type',
            label: await helpers.translate('Type'),
            value: {
                type: 'string',
                value: project.is_template.value ? await helpers.translate('Template') : await helpers.translate('Project'),
            },
        },
        {
            id: 'Name',
            label: await helpers.translate('Name'),
            value: {
                type: 'string',
                value: project.name.displayValue,
            },
        },
        {
            id: 'Description',
            label: await helpers.translate('Description'),
            value: {
                type: 'string',
                value: project.short_description.displayValue || '-',
            },
        },
        {
            id: 'Project_number',
            label: await helpers.translate('Project number'),
            value: {
                type: 'string',
                value: project.number.displayValue,
            },
        },
        {
            id: 'Project_status',
            label: await helpers.translate('Project status'),
            value: {
                type: 'string',
                value: project.status.displayValue,
            },
        },
        {
            id: 'source',
            label: await helpers.translate('Source'),
            value: {
                type: 'string',
                value: api.state.entityCardRepeaterData.length > 0 ? api.state.entityCardRepeaterData[0].sourceType.label : '-',
            },
        },
        {
            id: 'Primary_process_to_analyze',
            label: await helpers.translate('Primary process to analyze'),
            value: {
                type: 'string',
                value: api.state.entityCardRepeaterData.length > 0 ? api.state.entityCardRepeaterData[0].table.label : '-',
            },
        },
        {
            id: 'KPI_dashboard',
            label: await helpers.translate('KPI dashboard'),
            value: {
                type: 'string',
                value: project.par_dashboard_id.displayValue ? project.par_dashboard_id.displayValue : '-',
            },
        },
        {
            id: 'Auto_retire',
            label: await helpers.translate('Auto retire'),
            value: {
                type: 'string',
                value: project.auto_retire.value ? await helpers.translate('Yes') : await helpers.translate('No'),
            },
        },
        {
            id: 'Use_child_table_configuration',
            label: await helpers.translate('Use child table configuration(s) as activities'),
            value: {
                type: 'string',
                value: project.is_le_progress.value ? await helpers.translate('Yes') : await helpers.translate('No'),
            },
        },
        {
            id: 'Restricted',
            label: await helpers.translate('Restricted'),
            value: {
                type: 'string',
                value: project.restricted.value ? await helpers.translate('Yes') : await helpers.translate('No'),
            },
        },
    ];
    // don't show kpi dashboard for playbook datasource
    if (api.state.isPlaybookSourceTypeProject) {
        objectivesLabelValueStack = objectivesLabelValueStack.filter(item => item.id !== "KPI_dashboard");
    }
    api.setState('objectivesLabelValueStack', objectivesLabelValueStack);

     if (project.error_message.value) {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'project-error-message',
                status: 'critical',
                icon: 'circle-close-outline',
                content: project.error_message.displayValue,
                action: {
                    type: 'dismiss'
                },
            }]
        });
    }
}
