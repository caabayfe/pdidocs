/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api}) {
	return { 
    "aria-label": api.state.closeButtonTranslatedAriaLabel
  };
}
