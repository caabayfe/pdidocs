/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({ api, event, helpers, imports }) {
    const editSummary = async () => {
        let sectionConfigObject = {
            ...api.state.sectionConfig
        };
        sectionConfigObject.summary = {
            ...api.state.sectionConfig.summary,
            isEdit: true,
            expanded: true,
            toggleIcon: 'chevron-up-outline',
            toggleTooltipText: await helpers.translate('Collapse Summary')
        };
        api.setState('sectionConfig', sectionConfigObject);
    };

    editSummary();

    if (api.state.initialSectionLoad.summary) {
        var initialSectionLoadObj = {
            ...api.state.initialSectionLoad
        };
        initialSectionLoadObj.summary = false;
        api.setState("initialSectionLoad", initialSectionLoadObj);
    }
}
