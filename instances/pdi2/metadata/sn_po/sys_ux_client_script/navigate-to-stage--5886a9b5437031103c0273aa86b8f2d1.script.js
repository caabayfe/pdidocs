/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    if (event.elementId === 'stepper') {
        api.setState('selectedStage', event.payload.value);

        const {
            currentView,
            VIEWS
        } = api.state;

        // If user is on entity, activity, or breakdown form and is navigating away
        // from Scope your analysis step, block direct navigation and trigger
        // form submit from "Stepper selected item set" event in the stepper
        if (
            event.payload.value !== 'scope-your-analysis' &&
            (
                currentView.view === VIEWS.ACTIVITY_FORM ||
                currentView.view === VIEWS.BREAKDOWN_FORM ||
                currentView.view === VIEWS.ENTITY_FORM
            )
        ) {
            return;
        }

        if (event.payload.value === 'scope-your-analysis') {
            return;
        } else if (event.payload.value === 'set-objectives') {
            helpers.navigate.to('promin_project', {
                projectId: api.context.props.projectId,
                stage: 'set-objectives'
            }, null, true);
        } else if (event.payload.value == 'find-improvement-opportunities') {
            helpers.navigate.to('promin_project', {
                projectId: api.context.props.projectId,
                stage: 'find-improvement-opportunities'
            }, null, true);
        } else if (event.payload.value === 'overview') {
            helpers.navigate.to('promin_project', {
                projectId: api.context.props.projectId,
                stage: 'overview'
            }, null, true);
        }
        helpers.timing.setTimeout(() => {
            api.emit('SCREEN_STATUS_CHANGED', {
                status: 'closed'
            });
        }, 200);
    } else if (event.elementId === 'next_step_button') {
        if (!api.state.scopeAnalysisValid.isValid) {
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                items: [{
                    id: 'improvement-opportunity-error',
                    status: 'critical',
                    icon: 'exclamation-triangle-outline',
                    content: api.state.scopeAnalysisValid.message,
                    action: {
                        type: 'dismiss'
                    },
                }],
            });
            return;
        }
        const nextPageName = api.state.isPlaybookSourceTypeProject ? "overview" : "find-improvement-opportunities";
        helpers.navigate.to('promin_project', {
                projectId: api.context.props.projectId,
                stage: nextPageName
            }, null, true);
            helpers.timing.setTimeout(() => {
            api.emit('SCREEN_STATUS_CHANGED', {
                status: 'closed'
            });
        }, 200);
    } else if (event.elementId === 'previous_step_button') {
        helpers.navigate.to('promin_project', {
                projectId: api.context.props.projectId,
                stage: 'set-objectives'
            }, null, true);
            helpers.timing.setTimeout(() => {
            api.emit('SCREEN_STATUS_CHANGED', {
                status: 'closed'
            });
        }, 200);
    } else if (event.elementId === 'view_start_condition') {
        helpers.navigate.to(undefined, undefined, {}, false, false, null, {
            url: `/promin_finding_def_condition.do?sys_id=${api.state.advancedConditionForm.fields.startCondition.value}`,
        });
    } else if (event.elementId === 'view_end_condition') {
        helpers.navigate.to(undefined, undefined, {}, false, false, null, {
            url: `/promin_finding_def_condition.do?sys_id=${api.state.advancedConditionForm.fields.endCondition.value}`,
        });
    } else if (event.elementId === 'advanced_view') {
        helpers.navigate.to(undefined, undefined, {}, false, false, null, {
            url: `/promin_project.do?sys_id=${api.context.props.projectId}`,
        });
    } else if (event.elementId === 'get_project_entities') {
        // No entities exist in project so send user to set objectives page
        // to create new entity
        helpers.navigate.to('promin_project', {
            projectId: api.context.props.projectId,
            stage: 'set-objectives'
        }, null, true);
        helpers.timing.setTimeout(() => {
            api.emit('SCREEN_STATUS_CHANGED', {
                status: 'closed'
            });
        }, 200);
    } else if (event.elementId == "dirty_project_alert" && event.name=='NOW_ALERT#TEXT_LINK_CLICKED') {
        helpers.navigate.to("promin_project", {
            projectId: api.context.props.projectId,
            stage: 'overview'
        }, null, true);
        helpers.timing.setTimeout(() => {
            api.emit('SCREEN_STATUS_CHANGED', {
                status: 'closed'
            });
        }, 200);
    }
}
