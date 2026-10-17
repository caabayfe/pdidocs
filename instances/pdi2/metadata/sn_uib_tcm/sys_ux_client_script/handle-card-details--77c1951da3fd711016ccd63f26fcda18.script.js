/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    // Logic to expand/collapse communication card using chevron
    const {elementId, name, payload} = event;

    const overviewIcons = {
        expand: 'chevron-up-outline',
        collapse: 'chevron-down-outline'
    };

    const toggleSummary = async () => {
        const expandSummary = api.state.expandData.expanded;
        const icon = expandSummary ? overviewIcons.collapse : overviewIcons.expand;
        const iconLabel = expandSummary ? await helpers.translate("Expand card") : await helpers.translate("Collapse card");
        let obj = {
            ...api.state.expandData,
            icon: icon,
            label: iconLabel,
            expanded: !expandSummary
        };
        api.setState('expandData', {...obj});
    };

    toggleSummary();
}
