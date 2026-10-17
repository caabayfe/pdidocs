/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers  
*/
async function handler({ api, event, helpers, imports }) {

  api.setState('dataActivity', true);

  let config = {
    "panels": {
      "ciClasses": {
        "title": "Select Classes",
        "description": {
          "1": await helpers.translate("Add classes for which to explore CMDB 360 data. You can apply filters to trim down the scope of data to explore. Select ‘All Classes’ to view CMDB 360 data for all classes. You can’t apply a filter to the ‘All Classes’ option."),
          "2": await helpers.translate('Select CI classes you want to analyze for gaps in reported CMDB 360 data. You can apply conditions to filter for data within a class.'),
          "3": ''
        }
      },
      "singleClass": {
        "title": await helpers.translate("Select Class"),
        "description": {
          "1": '',
          "2": '',
          "3": await helpers.translate('Select a class to check for discrepancies in attribute values across discovery sources or compare to CMDB. You can apply filters to trim down the scope of data to explore.')
        }
      },
      "discoverySources": {
        "title": await helpers.translate("Discovery Sources"),
        "description": {
          "1": await helpers.translate("Select discovery sources to restrict CMDB 360 data to specific discovery sources. Leave the prompt empty to retrieve records for all discovery sources."),
          "2": '',
          "3": await helpers.translate("Select at least two discovery sources for which to compare attribute values. Select 'Compare to CMDB' if you want to instead compare the attributes against CMDB. Select a service or CMDB group to further filter the output.")
        }
      },
      "resultsLayout": {
        "title": await helpers.translate("Results Layout"),
        "description": {
          "1": await helpers.translate("Configure the list view for the CMDB 360 query results. Select 'Show unique CMDB 360 records' to consolidate all CMDB 360 records for each unique CI. Select 'Show CI records by discovery source' to view all CMDB 360 records for each CI/discovery source pair. Select a service or CMDB group to further filter the output."),
          "2": await helpers.translate("Configure the list view for the CMDB 360 query results. Select 'Show unique CMDB 360 records' to consolidate all CMDB 360 records for each unique CI. Select 'Show CI records by discovery source' to view all CMDB 360 records for each CI/discovery source pair. Select a service or CMDB group to further filter the output."),
          "3": ''
        }
      },
      "gapSetup": {
        "title": await helpers.translate("Gap Setup"),
        "description": {
          "1": '',
          "2": await helpers.translate("Select at least one non-reporting discovery source and up to 2 reporting discovery sources. Non-reporting discovery sources are the sources that don’t report the CI record and the reporting discovery sources do report the CI record. You must select a non-reporting discovery source and you can select up to two reporting discovery sources."),
          "3": ''
        }
      },
      "attributesToCompare": {
        "title": await helpers.translate("Attributes to Compare"),
        "description": {
          "1": '',
          "2": '',
          "3": await helpers.translate('Add attributes for which to compare values among discovery sources, apply a condition between the attributes to trim down results.')
        }
      },
    },
    "queryTypes": {
      "1": {
        "name": await helpers.translate("Get records"),
        "panels": [
          "ciClasses",
          "discoverySources",
          "resultsLayout"
        ]
      },
      "2": {
        "name": await helpers.translate("Find Gap"),
        "panels": [
          "ciClasses",
          "gapSetup",
          "resultsLayout"
        ]
      },
      "3": {
        "name": await helpers.translate("Compare attributes values"),
        "panels": [
          "singleClass",
          "attributesToCompare",
          "discoverySources"
        ]
      }
    }
  };

  api.setState('config', config);
  api.setState('currentStep', 1);

  let resultsTypeOptions = [{ "id": "ci_records", "label": await helpers.translate("Show unique CMDB 360 records"), "checked": true }, { "id": "multisource_records", "label": await helpers.translate("Show CI records by discovery source") }];
  api.setState('resultsTypeOptions', resultsTypeOptions);

  let limitResultsToOptions = [{ "id": "none", "label": await helpers.translate("All") }, { "id": "appl_service", "label": await helpers.translate("Application Services") }, { "id": "tech_service", "label": await helpers.translate("Technical Services") }, { "id": "cmdb_group", "label": await helpers.translate("CMDB Groups") }];
  api.setState('limitResultsToOptions', limitResultsToOptions);

  let attributesToCompareOptions = [{ "id": "or", "label": await helpers.translate("Any attribute doesn't match"), "checked": true }, { "id": "and", "label": await helpers.translate("Every attribute doesn't match") }];
  api.setState('attributesToCompareOptions', attributesToCompareOptions);

  // Prevent Multiple Firing of Event
  if (api.context.props.cb != api.state.cb || api.context.props.querySysId != api.state.querySysId || api.context.props.queryType != api.state.queryType) {
    let queryType = Number(api.context.props.queryType);
    let querySysId = api.context.props.querySysId;
    api.setState('cb', api.context.props.cb);
    api.setState('reportURL', '');
    api.setState('reportQuerySysId', '');
    let query = {};

    if (querySysId) {
      // Load Query
      api.setState('dataActivityMessage', await helpers.translate('Loading Query'));
      api.setState('dataActivity', true);
      api.data.multisource_get_query.execute({
        'sys_id': querySysId
      });
      api.setState('isNew', false);
    } else {
      // New query
      if (queryType > 3 || queryType < 1)
        queryType = 1;

      api.setState('queryType', queryType);
      api.setState('currentStep', 1);
      api.setState('querySysId', '');
      api.setState('isNew', true);
      api.setState('hasSchedule', false);
      api.setState('nonReportingDiscoverySources', []);

      query = {
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
      switch (queryType) {
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

      api.setState('schedule', {
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
      attributesToCompareOptions.forEach((element) => element.checked = (element.id === attributesToCompareType) ? true : false);
      api.setState('attributesToCompareOptions', attributesToCompareOptions);

      ////////////////////// Init Stepper and Cards

      let stepperConfig = [];
      // .forEach(function (element) {
      for (const element of config.queryTypes[queryType].panels) {
        stepperConfig.push({
          "id": element,
          "label": config.panels[element].title,
          "progress": "none",
          "disabled": true,
          "visited": false
        });
      };
      api.setState('stepperConfig', stepperConfig);
      api.setState('stepperCurrentStep', 'ciClasses');

      let currentStep = 1;

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
      api.setState('headerText', await helpers.translate("CMDB 360 Query - {0}", config.queryTypes[queryType].name));

      // Show/Hide correct buttons
      api.setState('backButtonHidden', (currentStep === 1));
      api.setState('continueButtonHidden', (currentStep === config.queryTypes[queryType].panels.length));
      api.setState('saveButtonHidden', (currentStep !== config.queryTypes[queryType].panels.length));

      // Hide save buttons on any navigation 
      api.setState('saveGoToDashboardButtonHidden', true);
      api.setState('saveAndRunButtonHidden', true);
      api.setState('dataActivity', false);
    }

    let elementId = event.elementId;
    let currentStep = 1;
    let oldStep = 1; 

    if (elementId === 'continueButton')
      currentStep++;

    if (elementId === 'backButton')
      currentStep--;

    if (elementId === 'stepper') {
      var item = event.payload.item;
      if (!item.disabled) {
        currentStep = config.queryTypes[queryType].panels.findIndex((element) => {
          return element === item.id;
        }) + 1;
      }
    }

    let newVisiblePanel = config.queryTypes[queryType].panels[currentStep - 1];
    let values = { 'ciClasses': true, 'singleClass': true, 'discoverySources': true, 'resultsLayout': true, 'gapSetup': true, 'attributesToCompare': true, 'saveOptions': true };

    values[newVisiblePanel] = false;
    api.setState('panelsHidden', values);
    api.setState('currentStep', currentStep);
    api.setState('stepperCurrentStep', newVisiblePanel);

    // Set Step Label
    api.setState('headerText', await helpers.translate("CMDB 360 Query - {0}", config.queryTypes[queryType].name));

    // Show/Hide correct buttons
    api.setState('backButtonHidden', (currentStep === 1));
    api.setState('continueButtonHidden', (currentStep === config.queryTypes[queryType].panels.length));
    api.setState('saveButtonHidden', (currentStep !== config.queryTypes[queryType].panels.length));

    // Hide save buttons on any navigation 
    api.setState('saveGoToDashboardButtonHidden', true);
    api.setState('saveAndRunButtonHidden', true);

    // Fix for Radio buttons
    resultsTypeOptions.forEach((element) => element.checked = (element.id === query.query_json.result_type) ? true : false);
    api.setState('resultsTypeOptions', resultsTypeOptions);

    // Fix for flickering condtion builder
    if (newVisiblePanel === 'ciClasses') {
      // copy condition to working
      query.query_json.class_conditions.forEach((o) => {
        o.workingCondition = o.condition;
      });
    }
    
    let cardTitle = config.panels[newVisiblePanel].title;
    let cardDescription = config.panels[newVisiblePanel].description[queryType];
    
    api.setState('cardTitle', cardTitle);
    api.setState('cardDescription', cardDescription);
    api.setState('query', query);
    api.setState('config', config);
    api.setState('currentStep', 1);
    
  }
}
