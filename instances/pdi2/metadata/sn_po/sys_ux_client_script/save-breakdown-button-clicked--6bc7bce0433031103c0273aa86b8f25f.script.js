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
    let breakdownForm = { ...api.state.breakdownForm
    };

    const missingFields = [];

    if (breakdownForm.fields.filter.partial) {
        missingFields.push(await helpers.translate('Filter condition'));
    }

    if (!breakdownForm.fields.field.value) {
        missingFields.push(await helpers.translate('Column'));
    }

    if (missingFields.length > 0) {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'save-breakdown-error',
                status: 'critical',
                icon: 'exclamation-triangle-outline',
                content: await helpers.translate('The following mandatory fields are not filled in: {0}', missingFields.join(', ')),
                action: {
                    type: 'dismiss'
                },
            }],
        });

        if (api.state.selectedStage !== 'scope-your-analysis') {
            // Timeout is needed, otherwise stepper state does not visually update
            helpers.timing.setTimeout(() => {
                api.setState('selectedStage', 'scope-your-analysis');
            }, 500);
        }

        return;
    }

    let refTableName = '';

    // Only show the table name in the list if a breakdown field has a display name
    // and add filter condition is selected
    if (breakdownForm.fields.displayName.value && breakdownForm.fields.hasFilter.value) {
        refTableName = breakdownForm.fields?.field.details?.referenceTable || '';
    }

    const breakdownPayload = JSON.stringify({
        entity: api.state.selectedEntity._row_data.uniqueValue,
        field: api.state.breakdownForm.fields.field.value,
        display_name: breakdownForm.fields.displayName.value,
        has_filter: breakdownForm.fields.hasFilter.value,
        filter_table: refTableName,
        filter: breakdownForm.fields.filter.value,
    });

    const currentView = { ...api.state.currentView };
    const isEditMode = currentView.params.mode === 'EDIT' ? true : false;

    if (isEditMode) {
        api.data.update_promin_breakdown.execute({
            sysId: api.state.selectedBreakdownID,
            breakdownPayload,
        });
    } else {
        api.data.create_promin_breakdown.execute({
            breakdownPayload,
        });
    }
}
