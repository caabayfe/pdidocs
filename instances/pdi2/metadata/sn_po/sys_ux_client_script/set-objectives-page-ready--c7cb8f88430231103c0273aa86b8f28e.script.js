/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const isTemplate = api.context?.props?.isTemplate;
    const projectId = api.context?.props?.projectId;
    const isNewProject = Boolean(projectId === '-1');

    const stages= [
        {
            "id": "set-objectives",
            "label": await helpers.translate("Set objectives"),
            "progress": "done",
            "disabled": false,
        },
        {
            "id": "scope-your-analysis",
            "label": await helpers.translate("Scope your analysis"),
            "progress": "none",
            "disabled": isNewProject,
        },
        {
            "id": "find-improvement-opportunities",
            "label": await helpers.translate("Set improvement opportunities"),
            "progress": "none",
            "disabled": isNewProject,
        },
        {
            "id": "overview",
            "label": await helpers.translate("Review and mine"),
            "progress": "none",
            "disabled": isNewProject,
        }
    ];

    api.setState('stageItems',stages);

    if (isNewProject && isTemplate === 'true') {
        const projectTemplateDetails = { ...api.state.projectTemplateDetails };
        projectTemplateDetails.isTemplate = true;
        api.setState('projectTemplateDetails', projectTemplateDetails);
    }

    if (isNewProject) {
        api.setState('collapseVerticalTabs', false);
        api.setState('resizablePanesDividerPosition', '75');
    } else {
        api.setState('collapseVerticalTabs', true);
        api.setState('resizablePanesDividerPosition', '-48px');
    }

    const projectTypes = [{
        id: 'PROJECT',
        label: await helpers.translate('Project')
    }, {
        id: 'TEMPLATE',
        label: await helpers.translate('Template')
    }];

    api.setState('projectTypes', projectTypes);
}
