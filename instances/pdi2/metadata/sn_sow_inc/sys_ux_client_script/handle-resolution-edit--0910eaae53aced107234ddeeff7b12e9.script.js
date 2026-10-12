/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const editResolution = async () => {
        let sectionConfigObject = {
            ...api.state.sectionConfig
        };
        sectionConfigObject.resolution = {
            ...api.state.sectionConfig.resolution,
            isEdit: true,
            expanded: true,
            toggleIcon: 'chevron-up-outline',
            toggleTooltipText: await helpers.translate('Collapse Resolution')
        };
        api.setState('sectionConfig', sectionConfigObject);
    };

    editResolution();

    if (api.state.initialSectionLoad.resolution) {
        var initialSectionLoadObj = {
            ...api.state.initialSectionLoad
        };
        initialSectionLoadObj.resolution = false;
        api.setState("initialSectionLoad", initialSectionLoadObj);
    }
}
