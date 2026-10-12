/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    let elementId = event.elementId; 
    let currentStep = api.state.currentStep;
    let oldStep = api.state.currentStep;
    let config = api.state.config;
    let queryType = api.state.queryType;
    let query = api.state.query;

    if(elementId === 'continueButton')
        currentStep++;

    if(elementId === 'backButton')
        currentStep--;

    if(elementId === 'stepper') {
        var item = event.payload.item;
        if(!item.disabled) {
            currentStep = config.queryTypes[queryType].panels.findIndex((element) => {
                return element === item.id;
            }) + 1;
        }
    }

    let newVisiblePanel = config.queryTypes[queryType].panels[currentStep - 1];
    let values = {'ciClasses' : true,'singleClass' : true,'discoverySources' : true,'resultsLayout' : true,'gapSetup' : true,'attributesToCompare' : true,'saveOptions' : true};

    values[newVisiblePanel] = false;
    api.setState('panelsHidden',values);
    api.setState('currentStep',currentStep); 
    api.setState('stepperCurrentStep',newVisiblePanel);

    // Set Step Label
    api.setState('headerText',await helpers.translate("CMDB 360 Query - {0}", config.queryTypes[queryType].name));
   
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
    api.setState('resultsTypeOptions',[]);
    helpers.timing.setTimeout(() => {
        api.setState('resultsTypeOptions',resultsTypeOptions);
    }, 0);

    // Fix for flickering condtion builder
    if(newVisiblePanel === 'ciClasses') {
        // copy condition to working
        query.query_json.class_conditions.forEach((o) => {
            o.workingCondition = o.condition;
        });
    } 
    api.setState('query', query); 
    let cardTitle = await helpers.translate(config.panels[newVisiblePanel].title);
    let cardDescription = await helpers.translate(config.panels[newVisiblePanel].description[queryType]);
    api.setState('cardTitle',cardTitle);
    api.setState('cardDescription',cardDescription);
    api.emit('CHECK_FORM_STATUS');
}
