/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    // Learn about simulations link
    if (event.elementId === 'button_bare_2') {
        api.emit('NAV_ITEM_SELECTED', {
            external: {
                url: '/api/now/v1/context_doc_url/configure-run-auto-resolution'
            }
        });
    }
    // Go to app store link
    else if (event.elementId === 'app_store_button') {
        api.emit('NAV_ITEM_SELECTED', {
            external: {
                url: 'https://store.servicenow.com/sn_appstore_store.do#!/store/application/31f5f491c3a710100bf407720f40ddf4/6.2.2?referer=%2Fstore%2Fsearch%3Flistingtype%3Dallintegrations%25253Bancillary_app%25253Bcertified_apps%25253Bcontent%25253Bindustry_solution%25253Boem%25253Butility%25253Btemplate%26q%3Dnlu%2520workbench&sl=sh'
            }
        });
    }
}
