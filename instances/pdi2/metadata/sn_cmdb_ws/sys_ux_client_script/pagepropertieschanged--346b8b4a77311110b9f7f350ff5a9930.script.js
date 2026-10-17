/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({ api, event, helpers, imports }) {

  // Prevent Multiple Firing of Event
  if (api.context.props.cb != api.state.cb || api.context.props.querySysId != api.state.querySysId || api.context.props.queryType != api.state.queryType) {
    let queryType = Number(api.context.props.queryType);
    let querySysId = api.context.props.querySysId;
    api.setState('cb', api.context.props.cb);
    api.setState('reportURL', '');
    api.setState('reportQuerySysId', '');
    

    if (querySysId) {
      // Load Query
      api.setState('dataActivityMessage',await helpers.translate('Loading Query'));
      api.setState('dataActivity',true);
      api.data.multisource_get_query.execute({
        'sys_id' : querySysId
      });
      api.setState('isNew',false);
    } else {
      // New query
      if (queryType > 3 || queryType < 1)
        queryType = 1;

      api.setState('queryType', queryType);
      api.setState('currentStep', 1);
      api.setState('querySysId', '');
      api.setState('isNew',true);
      api.setState('hasSchedule',false);
      api.setState('nonReportingDiscoverySources', []);
      
      let query = {
        "name": "",
        "description": "",
        "query_json": {
          "result_type": "ci_records",
          "is_diff": false,
          "diff": {
            "type": "",
            "field": ""
          },
          "results_filter": {
            "type": "none",
            "values": []
          },
          "class_conditions": [],
          "discovery_sources": []
        }
      };

      // Default values for new queries. 
      switch(queryType) {
        case 2:
          query.query_json.result_type = "multisource_records";
          break;
        case 3:
          query.query_json.is_diff = true;
          query.query_json.diff.type = "sourceVsSource";
          break;
      }
      
      api.setState('query', query);
      api.setState('querySysId', "");

      let attributesToCompareType = "or";

      api.setState('schedule',{
                "active": false,
                "run_type": "daily",
                "run_dayofmonth": "1",
                "run_dayofweek": "1",
                "hours": 0,
                "minutes": 0,
                "seconds": 0
        });

      // Set temp variables 
      api.setState('singleClassSelected', "");
      api.setState('singleClassSelectedCondition', "");
      api.setState('attributesToCompareType', attributesToCompareType);
      api.setState('attributesToCompare', []);

      // Fix for Radio buttons
      let attributesToCompareOptions = api.state.attributesToCompareOptions.map((x) => x);
      attributesToCompareOptions.forEach((element) => element.checked = (element.id === attributesToCompareType) ? true : false);
      api.setState('attributesToCompareOptions',attributesToCompareOptions);

      ////////////////////// Init Stepper and Cards

      let stepperConfig = [];
      // .forEach(function (element) {
      for (const element of api.state.config.queryTypes[queryType].panels) {
        stepperConfig.push({
          "id": element,
          "label": await helpers.translate(api.state.config.panels[element].title),
          "progress": "none",
          "disabled": true,
          "visited": false
        });
      };
      api.setState('stepperConfig', stepperConfig);
      api.setState('stepperCurrentStep', 'ciClasses');
   
      let currentStep = 1;
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
      api.setState('dataActivity',false);
    }
  }
}
