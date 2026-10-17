/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({ api, event, helpers, imports }) {
    const overviewIcons = {
        expand: 'chevron-down-outline',
        collapse: 'chevron-up-outline'
    };

    const toggleSummary = async () => {
        const isExpanded = api.state.sectionConfig.summary.expanded;
        const toggleIcon = isExpanded ? overviewIcons.expand : overviewIcons.collapse;
        const toggleTooltipText = isExpanded ? await helpers.translate("Expand Summary") : await helpers.translate("Collapse Summary");
        let sectionConfigObject = {
            ...api.state.sectionConfig
        };
        sectionConfigObject.summary = {
            ...api.state.sectionConfig.summary,
            toggleIcon: toggleIcon,
            toggleTooltipText: toggleTooltipText,
            expanded: !isExpanded
        };
        api.setState('sectionConfig', sectionConfigObject);
    };

    toggleSummary();
}
