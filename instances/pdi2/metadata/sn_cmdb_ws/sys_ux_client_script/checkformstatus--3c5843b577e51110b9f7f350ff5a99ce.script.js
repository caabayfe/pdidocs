/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({ api, event, helpers, imports }) {

    let queryType = parseInt(api.state.queryType);
    let currentStep = api.state.currentStep;
    let stepperConfig = JSON.parse(JSON.stringify(api.state.stepperConfig));
    var query = JSON.parse(JSON.stringify(api.state.query));
    let schedule = JSON.parse(JSON.stringify(api.state.schedule));
    let stopStep = 99;
    let saveable = true;

    stepperConfig.forEach(function (step, index) {
        if(currentStep == index + 1)
            step.visited = true;

        if (index >= stopStep) {
            step.disabled = true;
            step.progress = "none";
        } else {
            step.disabled = false;

            // Check Limited Results - Used on multiple cards
            let limitResultsTest = false;
            if ((query.query_json.results_filter.type === "none") || (query.query_json.results_filter.type != "none" && query.query_json.results_filter && query.query_json.results_filter.values.length > 0 && query.query_json.results_filter.values[0] != "") )
                limitResultsTest = true;

            switch (step.id) {
                case "ciClasses":
                    if (query.query_json.class_conditions.length !== 0 && step.visited) {
                        // Complete
                        step.progress = "done";
                    } else {
                        step.progress = "none";
                        if (stopStep === 99)
                            stopStep = index;
                    }
                    break;
                case "singleClass":
                    if (api.state.singleClassSelected && api.state.singleClassSelected != "" && step.visited) {
                        step.progress = "done";
                    } else {
                        step.progress = "none";
                        if (stopStep === 99)
                            stopStep = index;
                    }
                    break;
                case "discoverySources":
                    if(queryType === 1 && step.visited) {
                        step.progress = "done";
                    } else if(stopStep === 99) {
                        stopStep = index;
                    }
                    if(queryType === 2) {
                        if (queryType === 2 && query.query_json.discovery_sources && query.query_json.discovery_sources.length !== 0 && step.visited) {
                            step.progress = "done";
                        } else {
                            step.progress = "none";
                            if (stopStep === 99)
                                stopStep = index;
                        }
                    }
                    if(queryType === 3) {
                        if ((limitResultsTest && query.query_json.discovery_sources && query.query_json.discovery_sources.length > 1 && query.query_json.diff.type === 'sourceVsSource' && step.visited) || (limitResultsTest && query.query_json.discovery_sources && query.query_json.discovery_sources.length  > 0 && query.query_json.diff.type === 'goldenVsSource') && step.visited) {
                            step.progress = "done";
                        } else {
                            step.progress = "none";
                            if (stopStep === 99)
                                stopStep = index;
                        }
                    }            
                    break;
                case "resultsLayout":
                    if(limitResultsTest && step.visited) {
                        step.progress = "done";   
                    } else {
                        step.progress = "none";
                        if (stopStep === 99)
                            stopStep = index;                      
                    }
                    break;
                case "gapSetup":
                    if((query.query_json.excluded_discovery_source && query.query_json.excluded_discovery_source !== "") && step.visited) {
                        step.progress = "done";   
                    } else {
                        step.progress = "none";
                        if (stopStep === 99)
                            stopStep = index;                      
                    }
                    break;
                case "attributesToCompare":
                    // Complete
                    if (api.state.attributesToCompare && api.state.attributesToCompare.length !== 0 && step.visited) {
                        // Complete
                        step.progress = "done";
                    } else {
                        step.progress = "none";
                        if (stopStep === 99)
                            stopStep = index;
                    }
                    break;
            }
            if(step.progress != "done")
                saveable = false;
        }
    });

    if(!saveable && !api.state.panelsHidden.saveOptions) {
        let panels = JSON.parse(JSON.stringify(api.state.panelsHidden));
        panels.saveOptions = true;
        api.setState('panelsHidden',panels);
        api.setState('saveButtonHidden', false);
        api.setState('saveAndRunButtonHidden', true);
    }
    
    api.setState('stepperConfig', stepperConfig);
    api.setState('saveable', saveable);
}
