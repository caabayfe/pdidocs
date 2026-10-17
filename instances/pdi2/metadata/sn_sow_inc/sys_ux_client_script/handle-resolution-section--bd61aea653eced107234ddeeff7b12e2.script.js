/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const overviewIcons = {
        expand: 'chevron-down-outline',
        collapse: 'chevron-up-outline'
    };

    const toggleResolution = async () => {
        const isExpanded = api.state.sectionConfig.resolution.expanded;
        const toggleIcon = isExpanded ? overviewIcons.expand : overviewIcons.collapse;
        const toggleTooltipText = isExpanded ? await helpers.translate("Expand Resolution") : await helpers.translate("Collapse Resolution");
        let sectionConfigObject = {
            ...api.state.sectionConfig
        };
        sectionConfigObject.resolution = {
            ...api.state.sectionConfig.resolution,
            toggleIcon: toggleIcon,
            toggleTooltipText: toggleTooltipText,
            expanded: !isExpanded
        };
        api.setState('sectionConfig', sectionConfigObject);
    };

    toggleResolution();
}
