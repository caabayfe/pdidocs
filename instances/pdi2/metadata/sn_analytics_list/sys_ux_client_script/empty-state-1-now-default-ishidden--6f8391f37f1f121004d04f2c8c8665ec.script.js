/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
        /*
        Show empty state only if no record and no columnFilterApplied by end user
        */
        return !(api?.state?.emptyRows && !api?.state?.isColumnFilterApplied);
}
