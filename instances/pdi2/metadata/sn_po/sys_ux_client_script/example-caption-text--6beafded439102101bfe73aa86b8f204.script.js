/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	const { exampleMap, selectedExample } = api.state;

  if (!selectedExample in exampleMap) {
    return '';
  }

	return exampleMap[selectedExample].caption;
}
