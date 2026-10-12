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
    const editImpactSummary = async () => {
        let sectionConfigObject = {
            ...api.state.sectionConfig
        };
        sectionConfigObject.impact = {
            ...api.state.sectionConfig.impact,
            isEdit: true,
            expanded: true,
            toggleIcon: 'chevron-up-outline',
            toggleTooltipText: await helpers.translate('Collapse Impact Summary')
        };
        sectionConfigObject.business_impact = {
            ...api.state.sectionConfig.business_impact,
            isEdit: true,
        };
        api.setState('sectionConfig', sectionConfigObject);
    };

    editImpactSummary();

    if (api.state.initialSectionLoad.impact) {
        var initialSectionLoadObj = {
            ...api.state.initialSectionLoad
        };
        initialSectionLoadObj.impact = false;
        initialSectionLoadObj.business_impact = false;
        api.setState("initialSectionLoad", initialSectionLoadObj);
    }

}
