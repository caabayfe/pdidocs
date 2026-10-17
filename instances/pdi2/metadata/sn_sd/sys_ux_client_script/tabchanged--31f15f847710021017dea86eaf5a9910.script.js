/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState('isLoading', true);
    var selectedTabLabel = event.payload.selectedTabLabel;
    var formatedIndicators = api.state.formatedIndicators;
    var currentTabs = api.state.currentTabs;
    var selectedTab = {};
    for(var i=0; i<currentTabs.length; i++){
        if(currentTabs[i].name == selectedTabLabel) selectedTab = currentTabs[i];
    }
    
    var currentIndicators = formatedIndicators.filter(function(indicator) {
        if (indicator.category == api.context.props.category) {
            if (selectedTab.sys_id == "ALL") {
                return indicator;
            } else {
                if (indicator.group == selectedTab.sys_id) return indicator;
            }
        }
    });

    api.setState('currentIndicators', currentIndicators);
    api.setState('currentTab',selectedTab );
    api.setState('isLoading', false);
}
