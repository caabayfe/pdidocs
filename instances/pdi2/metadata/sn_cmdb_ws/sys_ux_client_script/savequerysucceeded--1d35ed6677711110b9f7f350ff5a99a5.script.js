/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {

    const { SUCCESS_NOTIFICATION_PROPS, handleRemoveNotifications} = imports["sn_cmdb_ws.cmdbMultisourceUtil"]();   //const emit = api.emit;
    const notifications = [];

    let query = JSON.parse(JSON.stringify(api.state.query));
    api.setState('dataActivity',false);
    api.setState('isDirty', false); 
    api.setState('isNew', false);
    api.setState('hasSchedule',false);
    if(api.state.schedule.active)
        api.setState('hasSchedule',true);

    if(api.state.saveMode === 'save') {

        if(event.payload.data.output.result) { // New query return sys_id
            query.sys_id = event.payload.data.output.result[0];
            api.setState('query', query);
        } 

        notifications.push({
            ...SUCCESS_NOTIFICATION_PROPS,
            "id" : "saved_query",
            "content": await helpers.translate('Query successfully saved')
        });
    }  
 
    if(api.state.saveMode === 'saverun') {
        if(event.payload.data.output.result) { // New query return sys_id
            query.sys_id = event.payload.data.output.result[0];
            api.setState('query', query);
        } 
        api.data.register_multisource_query.execute({
            "querySysId" : query.sys_id
        });

        // Display Save Options
        let panelsHidden = api.state.panelsHidden;
        panelsHidden.saveOptions = true;
        api.setState('panelsHidden',panelsHidden);
        // Show Save button / Hide Save go to dashboard button
        api.setState('saveGoToDashboardButtonHidden', true);
        api.setState('saveAndRunButtonHidden', true);
        
        if(api.state.continueButtonHidden)
            api.setState('saveButtonHidden',false);  

    }  

    if(api.state.saveMode === 'savedashboard') {
        helpers.navigate.to('multisource-analytics',{}, {cb: Date.now()});
   
        // Reset to step one. Need to do this on save so correct tab is shown next time a query is displayed. 
        // Due to the page being cached.    
        let currentStep = 1;
        let config = api.state.config;
        let queryType = api.state.queryType; 

        let newVisiblePanel = config.queryTypes[queryType].panels[currentStep - 1];
        let cardTitle = config.panels[newVisiblePanel].title;
        let cardDescription = config.panels[newVisiblePanel].description[queryType];
        let values = {'ciClasses' : true,'singleClass' : true,'discoverySources' : true,'resultsLayout' : true,'gapSetup' : true,'attributesToCompare' : true,'saveOptions' : true};

        values[newVisiblePanel] = false;
        api.setState('panelsHidden',values);
        api.setState('currentStep',currentStep);
        api.setState('cardTitle',cardTitle);
        api.setState('cardDescription',cardDescription);
        api.setState('stepperCurrentStep',newVisiblePanel);

        // Set Step Label
        api.setState('headerText',"Query Builder - " + config.queryTypes[queryType].name);

        // Show/Hide correct buttons
        api.setState('backButtonHidden',(currentStep === 1));
        api.setState('continueButtonHidden',(currentStep === config.queryTypes[queryType].panels.length));
        api.setState('saveButtonHidden',(currentStep !== config.queryTypes[queryType].panels.length));
        
        // Hide save buttons on any navigation 
        api.setState('saveGoToDashboardButtonHidden', true);
        api.setState('saveAndRunButtonHidden', true);

        // Fix for Radio buttons
        let resultsTypeOptions = api.state.resultsTypeOptions.map((x) => x);
        resultsTypeOptions.forEach((element) => element.checked = (element.id === api.state.query.query_json.result_type) ? true : false);
        api.setState('resultsTypeOptions',resultsTypeOptions);

     }

    if(notifications.length > 0) {
        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: notifications
        });
    }
}
