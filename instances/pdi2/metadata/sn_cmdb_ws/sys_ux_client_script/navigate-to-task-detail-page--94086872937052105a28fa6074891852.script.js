/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
helpers.navigate.to(
            null,
            null,
            null,
            false,
            false,
            null, {
                url: '/' + event.payload.table + '.do?sys_id=' + event.payload.sys_id + '&sysparm_record_target=' +  event.payload.table,
                target: '_self'
            },
        );
}
