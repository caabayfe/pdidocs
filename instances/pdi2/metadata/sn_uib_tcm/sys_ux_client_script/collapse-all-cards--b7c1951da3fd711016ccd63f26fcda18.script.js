/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    // Logic to display all cards collapsed on page load 
    const {elementId, name, payload} = event;

    const overviewIcons = {
        expand: 'chevron-up-outline',
        collapse: 'chevron-down-outline'
    };

    const toggleSummary = async () => {
        const icon = api.state.collabTaskDetails.collapseAll ? overviewIcons.collapse : overviewIcons.expand;
        const iconLabel = api.state.collabTaskDetails.collapseAll ? await helpers.translate("Expand card") : await helpers.translate("Collapse card");
        let obj = {
            ...api.state.expandData,
            icon: icon,
            label: iconLabel,
            expanded: !api.state.collabTaskDetails.collapseAll
        };
        api.setState('expandData', {...obj});
    };

    toggleSummary();
}
