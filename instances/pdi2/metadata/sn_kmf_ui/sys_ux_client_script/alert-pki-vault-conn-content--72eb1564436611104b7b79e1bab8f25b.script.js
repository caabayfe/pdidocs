/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
    var msg = api.item.value;
    var end = msg.indexOf("https");
    if (end < 0)
        return msg;
    var msg = msg.slice(0, end);
    return msg;
}
