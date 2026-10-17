/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    if(api.state.query && api.state.query.name && api.state.query.name !== "") {
        api.setState('dataActivityMessage','Saving and Running Query');
        api.setState('dataActivity',true);
        api.setState('saveMode','saverun');
        var query_sys_id = api.state.querySysId;
        var query = JSON.parse(JSON.stringify(api.state.query)); 

        // Temp Variables
        let attributesToCompare = api.state.attributesToCompare;  
        let attributesToCompareType = api.state.attributesToCompareType;
        let values = [];
        attributesToCompare.forEach((element,index) => { 
            if(index != 0 && attributesToCompareType === "or"){
                values.push("OR" + element);
            } else {
                values.push(element);
            }
        });
        query.query_json.diff.field = values.join("^");

        // Must set query after editing because the page is being cached.
        api.setState("query",query);

        // Init Save
        if(api.state.isNew) {
            api.data.ms_save_query.execute({
                'queryInfo' : {"query_sys_id":null,"query_json" :JSON.stringify(query)}
            });
        } else { 
            api.data.ms_save_query.execute({
                'queryInfo' : {"query_sys_id":query.sys_id,"query_json" :JSON.stringify(query)}
            });
        }

    } else {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [
                {
                    id: 'alert1',
                    status: 'critical',
                    icon: 'info-circle-outline',
                    content: 'A query name is requried to save',
                    action: { type: 'dismiss' }
                }
            ]
        });
    }
}
