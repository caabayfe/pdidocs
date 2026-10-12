/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    let templateSysId = api.state.templateSysId;
    if(api.state.isNew)
        templateSysId = event.payload.data.output;
    
    if(api.state.saveMode == 'saveexit'){   
        helpers.navigate.to('de-duplication-template-library',{},{"templateSysId":templateSysId,"cb" : Date.now()});
        // on save and exit set network activity to true. this prevents a screen flash when we return to this page.
        api.setState('networkActivity',true);
    } else {

        api.setState('isNew',false);
        api.setState('isDirty',false);
        api.setState('templateSysId',templateSysId);
        
        let testSelectedTaskId = api.state.testSelectedTaskId;

        const display_preview_timeout = helpers.timing.setTimeout(() => {
            api.setState('display_preview_delay_warning',true);
        }, 5000);
        api.setState('timeoutId',display_preview_timeout);
        api.setState('display_preview_delay_warning', false);


        api.data.deduplication_template_preview.execute({
            'templateSysId':templateSysId,
            'taskId': testSelectedTaskId,
        });
    }
}
