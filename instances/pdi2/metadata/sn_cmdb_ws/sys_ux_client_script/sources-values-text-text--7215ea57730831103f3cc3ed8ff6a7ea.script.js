/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var sources = api.item.value.sources.value;
  var result = '';

  for (var i = 0; i < sources.length; i++) {
    // as shown in James' mockups, if there are more than 3 sources,
    // indicate that there are more with "..."
    if (i > 3) {
      result += '...';
      break;
    }

    if (i == sources.length - 1) {
      result += sources[i];
      break;
    }
    result += sources[i] + ', ';
  }

  if (!result) {
    result = helpers.translateSync('No discovery sources');
  }
  
	return result;
}
