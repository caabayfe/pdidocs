/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const showControllerElements = api.state.showControllerSelection;
  const validateNextButton = api.state.validateNextButton;
  const validateCreateButton = api.state.validateCreateButton;
  if(showControllerElements) {
    return {
        label: helpers.translateSync('Create'),
        appendToPayload: {
            context: 'modal-create'
        },
        disabled: !validateCreateButton
    };
  }
	return {
        label: helpers.translateSync('Next'),
        appendToPayload: {
            context: 'modal-next'
        },
        disabled: !validateNextButton
    };
}
