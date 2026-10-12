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
    if (event.payload.data.output.data.GlidePromin_Query.configuration.process == null) {
        api.setState('activityRecommendations', []);
        api.setState('processId', '');
        return;
    }
    const {
        perspectiveConfig: {
            controlFlow,
            other,
            resourceGroup
        },
        recommendedActivityFields,
        id
    } = event.payload.data.output.data.GlidePromin_Query.configuration.process;
    api.setState('processId', id);
    const labels = {
        controlFlow: await helpers.translate('State definition'),
        other: await helpers.translate('Recommended'),
        resource: await helpers.translate('Team definition'),
    };
    const fields = [];

    if (controlFlow)
        fields.push({ ...controlFlow,
            type: 'controlFlow',
            typeLabel: labels.controlFlow,
            sortIndex: 0,
        });

    if (resourceGroup) {
        fields.push({ ...resourceGroup,
            type: 'resourceGroup',
            typeLabel: labels.resource,
            sortIndex: 1
        });
    }
    const fieldValues = fields.map(field => field.fieldName);
    if (other) {
        other.forEach((field) => {
            if (!fieldValues.includes(field.fieldName)) {
                fields.push({ ...field,
                    type: 'other',
                    typeLabel: labels.other,
                    sortIndex: 2
                });
            }
        });
    }

    let recommendedFields = fields.map(field => ({
        ...field,
        'selected': false
    }));

    if (recommendedFields.length == 0) {
        recommendedFields = recommendedActivityFields.map((field, i) => ({
            fieldName: field,
            grouped: false,
            type: '',
            'selected': false,
            sortIndex: 1,
            id: i,
        }));
    }

    function compare(a, b) {
        if (a.sortIndex < b.sortIndex)
            return -1;
        if (a.sortIndex > b.sortIndex)
            return 1;
        return 0;
    }
    recommendedFields.sort(compare);
    const filteredRecommendations = recommendedFields.filter(item => !api.state.entityActivities.includes(item.fieldName));
    api.setState('activityRecommendations', filteredRecommendations);

    const {
        view: currentView
    } = api.state.currentView;
    const {
        VIEWS
    } = api.state;

    // Labels are only needed in activity def views
    if (currentView === VIEWS.ACTIVITIES_LIST || currentView === VIEWS.ACTIVITY_FORM) {
        api.data.getfieldslabel.execute({
            table: api.state.selectedEntity.table.value,
            fields: filteredRecommendations.map(item => item.fieldName)
        });
    }
}
