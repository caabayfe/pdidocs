/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let sectionConfigObject = {
        ...api.state.sectionConfig
    };
    const editCause = async () => {
        sectionConfigObject.cause = {
            ...api.state.sectionConfig.cause,
            isEdit: true,
            expanded: true,
            toggleIcon: 'chevron-up-outline',
            toggleTooltipText: await helpers.translate('Collapse Cause')
        };
        api.setState('sectionConfig', sectionConfigObject);
    };

    editCause();

    if (api.state.initialSectionLoad.cause){
        var initialSectionLoadObj = {
            ...api.state.initialSectionLoad
        };
        initialSectionLoadObj.cause = false;
        api.setState("initialSectionLoad", initialSectionLoadObj);
    }
}
