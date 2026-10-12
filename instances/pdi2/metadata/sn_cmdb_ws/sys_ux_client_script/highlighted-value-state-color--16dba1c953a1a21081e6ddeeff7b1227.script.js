/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const {value, label} = api.item.value.instanceState;
  switch (value) {
    case 4:
    return 'critical';
    case 3:
    return 'green';
    case 2:
    return 'info';
    case 1:
    return 'gray';
    default:
    return 'gray';
  }
}
