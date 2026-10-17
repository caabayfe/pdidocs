/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { userPayload, mainTable } = api.state;
    const {element, referenceTable, referenceKey} = event.context.item.value;
    if (!referenceTable)
        return;
    
    const value=
        userPayload.attributes[mainTable]?.additionalFields?.[element]?.value||
        api.item.value?.value||
        '';

    if(!referenceKey) {
        helpers.navigate.to('record', {
            table: referenceTable,
            sysId: value
        }, {}, false, false, 'current');
    } else {
        var url = `api/now/table/${referenceTable}?sysparm_query=${referenceKey}=${value}&sysparm_limit=1`;
        helpers.snHttp(url, {
                method: 'GET'
            })
            .then(({
                response
            }) => {
                var sysId = response?.result[0]?.sys_id;
                helpers.navigate.to('record', {
                    table: referenceTable,
                    sysId: sysId
                }, {}, false, false, 'current');
            });
    };
    
}
