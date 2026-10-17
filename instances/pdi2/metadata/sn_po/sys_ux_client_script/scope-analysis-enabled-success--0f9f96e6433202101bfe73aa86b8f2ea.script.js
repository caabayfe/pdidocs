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
    const { isPlaybookSourceTypeProject } = api.state;
    const stages = [{
            "id": "set-objectives",
            "label": await helpers.translate("Set objectives"),
            "progress": "done"
        },
        {
            "id": "scope-your-analysis",
            "label": await helpers.translate("Scope your analysis"),
            "progress": "none"
        },
        {
            "id": "find-improvement-opportunities",
            "label": await helpers.translate("Set improvement opportunities"),
            "progress": "none"
        },
        {
            "id": "overview",
            "label": await helpers.translate("Review and mine"),
            "progress": "none"
        }
    ];
    const {result, message} = api.data.is_scope_analysis_stage_enabled.output.data.snPo.GlidePromin.prominIsScopeEnabled;
    
    const updatedStageItems = stages.reduce((acc, stage) => {
        // Skip "find-improvement-opportunities" if the flag is true
        if (isPlaybookSourceTypeProject && stage.id === 'find-improvement-opportunities') {
            return acc;
        }

        // Update certain stages with `disabled` flag
        if (stage.id === 'find-improvement-opportunities' || stage.id === 'overview') {
            acc.push({
                ...stage,
                disabled: !result,
            });
        } else {
            // Push unchanged stage
            acc.push(stage);
        }

        return acc;
    }, []);

  
    api.setState('scopeAnalysisValid', {
        isValid: result,
        message: message,
    });
    api.setState('stageItems', updatedStageItems);
}
