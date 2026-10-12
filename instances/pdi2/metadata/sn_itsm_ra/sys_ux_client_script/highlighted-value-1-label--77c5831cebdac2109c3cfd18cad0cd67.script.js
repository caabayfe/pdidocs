
    /**
    * @param {params} params
    * @param {api} params.api
    * @param {TransformApiHelpers} params.helpers
    */
    function evaluateProperty({
        api,
        helpers
    }) {
      if (api.context.props.customExpProps && api.context.props.customExpProps.useCase == "search") {
          return helpers.translateSync("Incident");
      } else {
        const {
            taskTable
        } = api.state;
        const state = api.state.state;
        // Decide the highlighted value based on the state of the predicted incident.
        if ((state == '6' || state == '7')) {
            if (taskTable.indexOf("Incident") != -1) {
                return helpers.translateSync("Copy resolution notes");
            } else {
                return helpers.translateSync("Incident");
            }
        }
        else {
            if (taskTable.indexOf("Incident") != -1 || taskTable.indexOf("Incident Task") != -1) {
                return helpers.translateSync("Link incident as parent");
            } else {
                return helpers.translateSync("Link incident");
            }
        } 
    }
}
