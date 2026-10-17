/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    helpers.navigate.to('multisource-analytics');  

    // Reset Values
    api.setState('singleClassSelected', "");
    api.setState('singleClassSelectedCondition', "");
    api.setState('attributesToCompare', []);
    api.setState('selectedAttribute', "");

    // Same logic from page properties changed function
    let currentStep = 1;
    let config = api.state.config;
    let queryType = api.state.queryType; 

    let newVisiblePanel = config.queryTypes[queryType].panels[currentStep - 1];
    let cardTitle = config.panels[newVisiblePanel].title;
    let cardDescription = config.panels[newVisiblePanel].description[queryType];
    let values = { 'ciClasses': true, 'singleClass': true, 'discoverySources': true, 'resultsLayout': true, 'gapSetup': true, 'attributesToCompare': true, 'saveOptions': true };

    values[newVisiblePanel] = false;
    api.setState('panelsHidden', values);
    api.setState('currentStep', currentStep);
    api.setState('cardTitle', cardTitle);
    api.setState('cardDescription', cardDescription);
    api.setState('stepperCurrentStep', newVisiblePanel);

    // Set Step Label
    api.setState('headerText', "Query Builder - " + config.queryTypes[queryType].name);

    // Show/Hide correct buttons
    api.setState('backButtonHidden', (currentStep === 1));
    api.setState('continueButtonHidden', (currentStep === config.queryTypes[queryType].panels.length));
    api.setState('saveButtonHidden', (currentStep !== config.queryTypes[queryType].panels.length));

    // Hide save buttons on any navigation 
    api.setState('saveGoToDashboardButtonHidden', true);
    api.setState('saveAndRunButtonHidden', true);
}
