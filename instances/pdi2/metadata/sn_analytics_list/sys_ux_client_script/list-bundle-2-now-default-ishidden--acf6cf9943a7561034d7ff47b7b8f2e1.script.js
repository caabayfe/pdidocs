/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
        /* Hide record list when
        1- No data source
        2- No records to display and no columnFilterApplied by the end user
        */
	return ((api?.context?.props?.dataSources?.length === 0) || (api?.state?.emptyRows && !api?.state?.isColumnFilterApplied));
}
