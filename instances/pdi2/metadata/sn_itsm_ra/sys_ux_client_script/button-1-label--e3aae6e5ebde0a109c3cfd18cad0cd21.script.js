
        /**
    * @param {params} params
    * @param {api} params.api
    * @param {TransformApiHelpers} params.helpers
    */
    function evaluateProperty({
        api,
        helpers
    }) {
        const {
            taskTable
        } = api.state;
        // Decide the action label based on the state of the predicted incident.
        const state = api.state.state;
        if ((state == '6' || state == '7') && taskTable.indexOf("Incident") != -1) {
            return helpers.translateSync("Copy resolution notes");
        }
        else {
            if (taskTable.indexOf("Incident") != -1) {
                return helpers.translateSync("Link incident as parent");
            } else {
                return helpers.translateSync("Link incident");
            }
        }   

    }
