/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const cardVisiblityIcons = {
        expand: 'chevron-down-outline',
        collapse: 'chevron-up-outline'
    };
    const isExpanded = api.state.timelineViewConfig.expanded;
    const toggleIcon = isExpanded ? cardVisiblityIcons.expand : cardVisiblityIcons.collapse;
    const toggleTooltipText = isExpanded ? await helpers.translate("Expand Timeline Section") : await helpers.translate("Collapse Timeline Section");
    api.setState('timelineViewConfig', {
        ...api.state.timelineViewConfig,
        toggleIcon: toggleIcon,
        toggleTooltipText: toggleTooltipText,
        expanded: !isExpanded
    });
}
