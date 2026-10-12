/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    switch(event.payload.item.id) {
        case 'nam_kpis':
            if(api.state.showNewModelKPIs) return;
            api.setState('showNewModelKPIs', true);
            api.setState('kpiCategoryList', [{"id":"created_by_me","label":await helpers.translate({message: 'Created by me', comment: 'Capital case created by me'})},{"id":"all","label":await helpers.translate("All")}]);
            break;
        case 'classic_kpis':
        default:
            if(!api.state.showNewModelKPIs) return;
            api.setState('showNewModelKPIs', false);
            api.setState('kpiCategoryList', [{"id":"bookmarked","label":await helpers.translate("Bookmarked")},{"id":"created_by_me","label":await helpers.translate({message: 'Created by me', comment: 'Capital case created by me'})},{"id":"all","label":await helpers.translate("All")}]);
            break;
    }
    api.setState('filterCondition', '');
    api.setState('showBookmarked', false);
    api.setState('kpiFilter', 'all');
    api.emit('CONTENT_UPDATED', {
        params: {
            filter: 'all'
        }
    });
}
