/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const res = api?.data?.look_up_a_single_record?.result?.security_task?.displayValue || ""; 
  if(res.includes("SEC")){
    return true;
  }
  return false;
}
