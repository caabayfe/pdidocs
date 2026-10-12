/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    try{
        switch(event.payload.item.page){
            case 'ci-list':
                helpers.navigate.to('ci-list', {'table': 'sys_cs_branding_setup'}, {'t': Date.now()});
                break;
            default:
                helpers.navigate.to(event.payload.item.page, null, null);
        }
    }catch(e){
        return;
    }
}
