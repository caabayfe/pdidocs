/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	try {
    const fields = api?.data?.record?.form?.fields;

    if (!fields) {
        return false;
      }
      return !(Object?.keys(fields)?.length === 0);
  } catch(error) {
    console.error("Error in evaluateProperty", error);
    return true;
  }
}
