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
        const isExpanded = api.state.relatedRecordsViewConfig.expanded;
        const toggleIcon = isExpanded ? cardVisiblityIcons.expand : cardVisiblityIcons.collapse;
        const toggleTooltipText = isExpanded ? await helpers.translate("Expand Related Records") : await helpers.translate("Collapse Related Records");
        api.setState('relatedRecordsViewConfig', {
            ...api.state.relatedRecordsViewConfig,
            toggleIcon: toggleIcon,
            toggleTooltipText: toggleTooltipText,
            expanded: !isExpanded
        });
}
