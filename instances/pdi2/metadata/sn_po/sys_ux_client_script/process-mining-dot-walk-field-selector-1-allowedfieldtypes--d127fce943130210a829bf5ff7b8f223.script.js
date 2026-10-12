/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
    const table = api.state?.automatedFindingForm?.table?.selectedValue;

    const allowedFieldTypes = ['reference','choice','boolean'];
		
    // Is external data table
    if (table && table.startsWith('sn_po_extdata_')) {
      allowedFieldTypes.push('string');
    }

    return allowedFieldTypes;
}
