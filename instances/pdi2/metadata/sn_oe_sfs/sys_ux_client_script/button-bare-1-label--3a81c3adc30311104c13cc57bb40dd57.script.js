/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  try {
	  const data = api.data.translations.output;
    return (data) ? data.next_experience_link : 'Learn more about Next Experience';
  } catch (error) {
    return 'Learn more about Next Experience';
  }
}
