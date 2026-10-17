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
    const {
        projectNumber,
        state,
        status,
        goal,
        name,
        description,
        sysCreatedBy,
        findingsCount,
        automatedFindingsCount,
        paDashboardName,
        projectEntities,
        source,
        errorMessage,
        permissions: {
            canWrite,
            canMine,
            canDelete,
        },
    } = api.data.get_project_details_1.output.data.GlidePromin_Query.projectConfiguration;
    
    const isPlaybookSourceTypeProject = projectEntities.some(entity => !entity.parentId && entity.sourceType.value === 'PLAYBOOK_DATA');

    const isMaint = api.context.session.user.roles?.includes('maint');
    const isFreemium = source.startsWith('FREEMIUM');

    const projectDetails = {
        ...api.state.projectData,
        projectNumber,
        miningState: state,
        status: status,
        createdBy: sysCreatedBy,
        goal,
        name,
        description,
        preview: false,
        findingsCount,
        automatedFindingsCount,
        paDashboardName,
        showSummary: false,
        source,
        errorMessage,
        canMine,
        canWrite,
        canDelete,
        projectEntities,
        readonly: !isMaint && isFreemium,
    };

    api.setState('projectData', projectDetails);
    api.setState('isPlaybookSourceTypeProject', isPlaybookSourceTypeProject);
    let stages = [
        {
            "id": "set-objectives",
            "label": await helpers.translate("Set objectives"),
            "progress": "done"
        },
        {
            "id": "scope-your-analysis",
            "label": await helpers.translate("Scope your analysis"),
            "progress": "done"
        },
        {
            "id": "find-improvement-opportunities",
            "label": await helpers.translate("Set improvement opportunities"),
            "progress": "done"
        },
        {
            "id": "overview",
            "label": await helpers.translate("Review and mine"),
            "progress": "partial"
        }
    ];

    if (isPlaybookSourceTypeProject) {
        stages = stages.filter(item => item.id !== 'find-improvement-opportunities');
    }

   api.setState('stageItems',stages);
   let projectActionsListItems = [
        {
        "id": "manage_watchlist",
        "label": await helpers.translate("Manage watchlist")
        },
        {
        "id": "copy_project_definition",
        "label": await helpers.translate("Copy project definition")
        },
        {
        "id": "extract_data_logs",
        "label": await helpers.translate("Extract data logs")
        },
        {
        "id": "delete_project",
        "label": await helpers.translate("Delete")
        },
    ];
    if (source?.startsWith('FREEMIUM')) {
        projectActionsListItems = projectActionsListItems.filter(item => item.id !== 'copy_project_definition' || item.id !== 'delete_project');
    }
   api.setState('projectActionsListItems',projectActionsListItems);
    // Set project name in workspace tab title
    if (projectDetails.name) {
        helpers.screen.updateStatus({
            title: await helpers.translate('{0} | Review and mine', projectDetails.name),
        });
    }
    api.data.get_current_user_id.refresh();
    api.data.get_touch_points_status.execute({
        projectId: api.state.projectId
    });
    api.setState('entityCardRepeaterData', projectEntities);

    const objectivesLabelValueStack = api.state.objectivesLabelValueStack.reduce((acc, item) => {
        if (item.id === "KPI_dashboard" && isPlaybookSourceTypeProject) {
            return acc;
        }
        if (item.id === "source") {
            // Source
            item.value = projectEntities[0].sourceType.label;
        } else if (item.id === "Primary_process_to_analyze") {
            // Primary entity
            item.value = projectEntities[0].table.label;
        }
        acc.push(item);
        return acc;
    }, []);
    
    if (isPlaybookSourceTypeProject) {
        // to make it inline with the other overview label-value-stack rows width
        objectivesLabelValueStack[objectivesLabelValueStack.length] = {
            label: '',
            value: ''
        };
    }
    api.setState('objectivesLabelValueStack', objectivesLabelValueStack);

    // Show project error message if present
    if (errorMessage) {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'project-error-message',
                status: 'critical',
                icon: 'circle-close-outline',
                content: errorMessage,
                action: {
                    type: 'dismiss'
                },
            }]
        });
    }
}
