function script({api, event}) {  
    let updatedParams = {};
    let { optionalParams } = api.state;
    if(event.elementId == "lifeCycleStage") {
        let dbOutput = api.data?.lifeCycleStage?.output;
        let hideOpenMap = !dbOutput || !dbOutput?.isValidLifeCycleStage;
        let disableEditRelationships = !dbOutput || dbOutput?.isAnApplicationService;
        updatedParams['hideOpenMap'] = hideOpenMap;
        updatedParams['disableEditRelationships'] = disableEditRelationships;
    } else if(event.elementId == "explore_ci_main_content" && event.name.includes("CI_UPDATE_SUCCEEDED")) {
        // add refreshRequested to trigger refresh in Explore CI Header
        updatedParams['refreshRequested'] = Date.now();
    }

    if(Object.keys(updatedParams).length > 0) {
           // if any of the params got updated
           let result = { ...optionalParams};
           for (const [key, value] of Object.entries(updatedParams)) {
               result[key] = value;
           }
          api.setState('optionalParams', result);
    }

}
