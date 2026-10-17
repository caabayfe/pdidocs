/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    api.setState('isLoading',true);
    var allCategories = JSON.parse((await imports['sn_sd.getBmInfo'](helpers, 'categories')).response.result);
    var allIndicators = JSON.parse((await imports['sn_sd.getBmInfo'](helpers, 'indicators?sysparm_category=' + api.context.props.category)).response.result);
    var allGroupBys = JSON.parse((await imports['sn_sd.getBmInfo'](helpers, 'group_tabs_by_category')).response.result);
    var currentTabs = allGroupBys[api.context.props.category];
    var currentCategory = allCategories.filter(function(item) {
        return item.sys_id == api.context.props.category;
    })[0];
    var currentTab = currentTabs[0];

    var formatedIndicators = imports['sn_sd.formatIndicators'](allIndicators);
    
    var tabArrayJSON = currentTabs.filter(function(tab) {
        tab.label = tab.name;
        tab.icon = null;
        return tab;
    });
    api.setState('currentCategory', currentCategory);
    api.setState('allCategories', allCategories);
    api.setState('allIndicators', allIndicators);
    api.setState('formatedIndicators', formatedIndicators);
    api.setState('allGroupBys', allGroupBys);
    api.setState('currentTabs', currentTabs);
    api.setState('currentTab', currentTab);
    api.setState('tabArrayJson', tabArrayJSON);
    api.setState('isLoading',false);
}
