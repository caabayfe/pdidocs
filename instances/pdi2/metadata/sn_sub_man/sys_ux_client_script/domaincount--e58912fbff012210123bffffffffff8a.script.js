/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
 const count = api.data.domain_count.output.data.GlideAggregate_Query[0].count || 0;
 if(count > 0) {
    api.setState('showDomainList', true);
 }
}
