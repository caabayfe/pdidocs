/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var previousPage = api.context.props.pageName;
    if(previousPage == 'hardening_score_comparison'){
        helpers.navigate.to("hardening_score_comparison");
    }else if(previousPage == 'all_settings'){
        helpers.navigate.to("all_settings");
    }else{
        helpers.navigate.to("overview");
    }
}
