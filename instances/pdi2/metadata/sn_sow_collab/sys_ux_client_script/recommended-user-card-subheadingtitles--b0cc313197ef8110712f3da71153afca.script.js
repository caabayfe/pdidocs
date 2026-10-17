/**
* @param {params} params
* @param {api} params.api
* @param {TransformApiHelpers} params.helpers
*/
function evaluateProperty({
api,
helpers
}) {
var title = [{
"clickable": false
}];

title[0]["label"] = api.item.value.title ? api.item.value.title : "";

return title;
}
