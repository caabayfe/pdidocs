/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({ api, event, helpers, imports }) {

    api.setState('dataActivity', false);
    api.setState('isDirty', false);
    api.setState('hasSchedule',false);

    let results = event.payload.data.output;
    let query_json = JSON.parse(results.query_json);
    results.query_json = query_json;

    if (results && results.query_json) {
        api.setState('query', results);
        // determine query type
        let queryType = 3;
        if (results.query_json.is_diff) {
            queryType = 3; // diff
        }
        else {
            if (results.query_json.excluded_discovery_source && results.query_json.excluded_discovery_source != "") {
                queryType = 2; // gap
            }
            else {
                queryType = 1; // record
            }
        }
        api.setState('queryType', queryType);
        if(results.has_schedule) {
            let schedule = results.schedule;
            let runTime = new Date(schedule.run_time);
            schedule.hours = runTime.getHours();
            schedule.minutes = runTime.getMinutes();
            schedule.seconds = runTime.getSeconds();  
            api.setState('schedule',schedule);
            if(schedule.active)
                api.setState('hasSchedule',true);
        } else {
            api.setState('schedule',{
                "active": false,
                "run_type": "daily",
                "run_dayofmonth": "1",
                "run_dayofweek": "1",
                "hours": 0,
                "minutes": 0,
                "seconds": 0
            });
        }

        // Set temp variables 
        if (queryType === 3) {
            if (results.query_json.class_conditions && results.query_json.class_conditions.length != 0) {
                api.setState('singleClassSelected', String(results.query_json.class_conditions[0].class_name));
                api.setState('singleClassSelectedCondition', String(results.query_json.class_conditions[0].condition));
            } else {
                api.setState('singleClassSelected', "");
                api.setState('singleClassSelectedCondition', "");
            }
        } else if (queryType === 2){
            api.setState('nonReportingDiscoverySources', results.query_json.excluded_discovery_source.split(","));
        }
         else if (queryType == 1) {
            let queryClasses = results.query_json.class_conditions.map((x) => x.class_name);
            api.setState('queryClasses', queryClasses);
        } 

        let attributesToCompare = [];
        let attributesToCompareType = "and";
        if (results.query_json.diff && results.query_json.diff.field) {
            let fields = results.query_json.diff.field.split('^');
            fields.forEach((field, index) => {
                if (field.substring(0, 2) === 'OR') {
                    attributesToCompareType = "or";
                    field = field.slice(2);
                }
                attributesToCompare.push(field);
            });
        }
        if(attributesToCompare.length === 1)
            attributesToCompareType = "or";

        api.setState('attributesToCompare', attributesToCompare);
        api.setState('attributesToCompareType', attributesToCompareType);

        // Fix for flickering condtion builder copy condition to working
        results.query_json.class_conditions.forEach((o) => o.workingCondition = o.condition);

        // Fix for Radio buttons
        let attributesToCompareOptions = api.state.attributesToCompareOptions.map((x) => x);
        attributesToCompareOptions.forEach((element) => element.checked = (element.id === attributesToCompareType) ? true : false);
        api.setState('attributesToCompareOptions', attributesToCompareOptions);
        
        let stepperConfig = [];
        api.state.config.queryTypes[queryType].panels.forEach(function (element) {
            stepperConfig.push({
                "id": element,
                "label": api.state.config.panels[element].title,
                "progress": "none",
                "disabled": true,
                "visited" : true
            });
        });
        api.setState('stepperConfig', stepperConfig);
        api.setState('stepperCurrentStep', 'ciClasses');

        let currentStep = 1; // Reset to step 1
        // Same logic from page properties changed function
        let config = api.state.config;

        let newVisiblePanel = config.queryTypes[queryType].panels[currentStep - 1];
        let cardTitle = await helpers.translate(config.panels[newVisiblePanel].title);
        let cardDescription = await helpers.translate(config.panels[newVisiblePanel].description[queryType]);
        let values = { 'ciClasses': true, 'singleClass': true, 'discoverySources': true, 'resultsLayout': true, 'gapSetup': true, 'attributesToCompare': true, 'saveOptions': true };

        values[newVisiblePanel] = false;
        api.setState('panelsHidden', values);
        api.setState('currentStep', currentStep);
        api.setState('cardTitle', cardTitle);
        api.setState('cardDescription', cardDescription);
        api.setState('stepperCurrentStep', newVisiblePanel);

        // Set Step Label
        api.setState('headerText',await helpers.translate("CMDB 360 Query - {0}", config.queryTypes[queryType].name));
 
        // Show/Hide correct buttons
        api.setState('backButtonHidden', (currentStep === 1));
        api.setState('continueButtonHidden', (currentStep === config.queryTypes[queryType].panels.length));
        api.setState('saveButtonHidden', (currentStep !== config.queryTypes[queryType].panels.length));

        // Hide save buttons on any navigation 
        api.setState('saveGoToDashboardButtonHidden', true);
        api.setState('saveAndRunButtonHidden', true);

        if(api.context.props.step && api.context.props.step === 'schedule'){
            api.setState('currentStep', 3);
            let panelsHidden = api.state.panelsHidden;
            panelsHidden.saveOptions = false;
            api.setState('panelsHidden',panelsHidden);
            // Hide Save button / show Save go to dashboard button
            api.setState('saveGoToDashboardButtonHidden', false);
            api.setState('saveAndRunButtonHidden', false);
            api.setState('saveButtonHidden',true);
            api.setState('continueButtonHidden', true)
        }
    }

    api.emit('CHECK_FORM_STATUS');
}
