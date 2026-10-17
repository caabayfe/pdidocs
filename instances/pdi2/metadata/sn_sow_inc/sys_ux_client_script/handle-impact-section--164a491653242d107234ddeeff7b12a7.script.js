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
    const overviewIcons = {
        expand: 'chevron-down-outline',
        collapse: 'chevron-up-outline'
    };

    const toggleImpact = async () => {
        const isExpanded = api.state.sectionConfig.impact.expanded;
        const toggleIcon = isExpanded ? overviewIcons.expand : overviewIcons.collapse;
        const toggleTooltipText = isExpanded ? await helpers.translate("Expand Impact") : await helpers.translate("Collapse Impact");
        let sectionConfigObject = {
            ...api.state.sectionConfig
        };
        sectionConfigObject.impact = {
            ...api.state.sectionConfig.impact,
            toggleIcon: toggleIcon,
            toggleTooltipText: toggleTooltipText,
            expanded: !isExpanded
        };
        api.setState('sectionConfig', sectionConfigObject);
    };

    toggleImpact();
}
