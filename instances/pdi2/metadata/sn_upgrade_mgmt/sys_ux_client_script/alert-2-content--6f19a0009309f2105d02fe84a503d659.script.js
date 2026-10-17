/**
      * @param {params} params
      * @param {api} params.api
      * @param {TransformApiHelpers} params.helpers
      */
    function evaluateProperty({api, helpers}) {
    	return helpers.translateSync('Upgrade summary is still running, it may take a few moments to load all data. Current status: {0}', api.state.summaryCompleteLabel);
    }
