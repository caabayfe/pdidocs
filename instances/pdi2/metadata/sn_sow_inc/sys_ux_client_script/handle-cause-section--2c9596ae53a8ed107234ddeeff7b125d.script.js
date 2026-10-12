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
    
        const toggleCause = async () => {
            const isExpanded = api.state.sectionConfig.cause.expanded;
            const toggleIcon = isExpanded ? overviewIcons.expand : overviewIcons.collapse;
            const toggleTooltipText = isExpanded ? await helpers.translate("Expand Cause") : await helpers.translate("Collapse Cause");
            let sectionConfigObject = {
                ...api.state.sectionConfig
            };
            sectionConfigObject.cause = {
                ...api.state.sectionConfig.cause,
                toggleIcon: toggleIcon,
                toggleTooltipText: toggleTooltipText,
                expanded: !isExpanded
            };
            api.setState('sectionConfig', sectionConfigObject);
        };
    
        toggleCause();
    }
