/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const isOOBPolicy = api?.state?.isOOBPolicy;
  if (isOOBPolicy == true) {
    return "Configured";
  } else {
    const conditionsOnTheUi = api?.state?.conditionsOnTheUI;
    for ( const condition of conditionsOnTheUi) {
    // If at least one condition is added, regardless of the value empty/non-empty
      if(condition.displayOff == false) return "Configured";
    }
    return "Not Configured";
  }
}
