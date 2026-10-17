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
    const stepper = [
    {
        "disabled": false,
        "id": "details",
        "label": await helpers.translate('Define'),
        "progress": "none"
    },
    {
        "disabled": true,
        "id": "configure",
        "label": await helpers.translate('Configure'),
        "progress": "none"
    }
];
    api.setState('stepper', stepper);
    if (api.context.props.patternName == 'edit') {
        api.setState('editing', true);
        api.setState('findingId', api.context.props.projectId)
    } else if (api.context.props?.findingId != null) {
        api.setState('editing', true);
        api.setState('findingId', api.context.props?.findingId);
    }

    if (api.context.props?.patternName == 'edit' || api.context.props?.findingId != null) {
        const stageItems = stepper.map((item) => {
            let state = 'done';
            return { ...item,
                disabled: false,
                progress: item.id == 'details' ? 'none' : state
            };
        });
        api.setState('stepper', stageItems);
        api.data.fetch_automated_finding.refresh();
    } else {
        helpers.screen.updateStatus({
            title: await helpers.translate('Create Improvement opportunity definition'),
        });
        const automatedFindingForm = api.state.automatedFindingForm;
        automatedFindingForm.findingName.value = "";
        automatedFindingForm.fields.value = "";
        automatedFindingForm.active.value = true;
        automatedFindingForm.impacted_kpi.selectedItems = [];
        automatedFindingForm.impacted_kpi.messages = [];
        let condition = `project=${api.context.props.projectId}^relation_type=^parent_entityISEMPTY`;
        api.setState('condition', condition);
        let processCondition = `sys_id=${api.context.props.projectId}`;
        api.setState('processCondition', processCondition);
    }

    api.data.get_impacted_kpi_items.execute({
        table: 'pa_indicators',
        searchTerm: '',
    });
    api.data.fetch_project_version.execute({
        projectId: api.context.props.projectId,
    });

    const automatedFindingsIntro = {
        "EXTRA_STEP": await helpers.translate("A pattern where routes differ by one additional step."),
        "EXTREME_DURATION": await helpers.translate("A pattern where transitions take significantly longer than the usual duration between the steps."),
        "EXTREME_REPETITION": await helpers.translate("A pattern where a transition repeats significantly more than the usual repetition range between the steps."),
        "EXTREME_NODE_TOUCH_POINT": await helpers.translate("A pattern where a step requires unusually large number of record updates than the normal range to progress to any next step."),
        "PINGPONG": await helpers.translate("A pattern where a record bounces back and forth between two steps without interruption."),
        "PATTERN": await helpers.translate("A pattern with series of repeating sequence of steps."),
        "REWORK": await helpers.translate("A pattern where a step in the process is repeated."),
        "PERFORMANCE_OUTLIER": await helpers.translate("A pattern where a group of records took longer to transition between steps than the average duration of another group."),
        "NODE_TOUCH_POINT_OUTLIER": await helpers.translate("A pattern where a group of records in a step gets updated more often compared to another group to progress to any next step."),
        "EXTREME_NODE_DURATION": await helpers.translate("A pattern where records stay in a step for a significantly longer duration than usual."),
        "NODE_DURATION_OUTLIER": await helpers.translate("A pattern where a group of records stays longer in a step than the average duration of another group."),
    };
    api.setState("automatedFindingsIntro", automatedFindingsIntro);
}
