/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {

    const saveTypes = {
        "save_button": "save",
        "run_button": "saverun",
        "dashboard_button": "savedashboard",
    };
    let saveMode = saveTypes[event.elementId];

    const { NowDateTime } = imports["sn_uxf.core_libraries"]();
    let scheudleTimeTest = true;
    if((api.state.schedule && api.state.schedule.active) && (api.state.schedule.hours > 23 || api.state.schedule.hours < 0 || api.state.schedule.minutes > 59 || api.state.schedule.minutes < 0 || api.state.schedule.seconds > 59 || api.state.schedule.seconds < 0))
        scheudleTimeTest = false; 

    if(api.state.query && api.state.query.name && api.state.query.name !== "" && !api.state.query.name.toUpperCase().startsWith('SPC:') && scheudleTimeTest) {
        api.setState('dataActivityMessage','Saving Query');
        api.setState('dataActivity',true);
        api.setState('saveMode',saveMode);
        var query_sys_id = api.state.querySysId;
        var query = JSON.parse(JSON.stringify(api.state.query)); 
        var schedule = JSON.parse(JSON.stringify(api.state.schedule));
        schedule.run_time = NowDateTime(new Date(1970, 1, 1, schedule.hours, schedule.minutes, schedule.seconds, 0)).format("YYYY-MM-DD HH:mm:ss");
        if(!query.execution_id) {
            schedule = null;
        } else if(!schedule.active && !schedule.sys_id){      
                schedule = null;
        };

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
            if(schedule && schedule.active && !schedule.sys_id) {
                // New schedule added
                schedule.query = query.sys_id;
                api.data.multisource_save_schedule.execute({
                    'schedule' : JSON.stringify(schedule)
                });
            }  
            if(schedule && schedule.sys_id) {
                api.data.multisource_update_schedule.execute({
                    'schedule' : JSON.stringify(schedule),
                    'sys_id' : schedule.sys_id
                });        
            }
            api.data.ms_save_query.execute({
                'queryInfo' : {"query_sys_id":query.sys_id,"query_json" :JSON.stringify(query)}
            });
        }

    } else {
        if(api.state.query.name == "") {
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                items: [
                    {
                        id: 'alert1',
                        status: 'critical',
                        icon: 'info-circle-outline',
                        content: await helpers.translate('A query name is requried to save'),
                        action: { type: 'dismiss' }
                    }
                ]
            });
        }
        if(api.state.query.name.toUpperCase().startsWith('SPC:')) {
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                items: [
                    {
                        id: 'alert3',
                        status: 'critical',
                        icon: 'info-circle-outline',
                        content: await helpers.translate('A query name cannot start with "SPC:"'),
                        action: { type: 'dismiss' }
                    }
                ]
            });
        }
        if(!scheudleTimeTest) {
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                items: [
                    {
                        id: 'alert2',
                        status: 'critical',
                        icon: 'info-circle-outline',
                        content: await helpers.translate('A valid schedule time is required'),
                        action: { type: 'dismiss' }
                    }
                ]
            });
        }
    }

    
}
