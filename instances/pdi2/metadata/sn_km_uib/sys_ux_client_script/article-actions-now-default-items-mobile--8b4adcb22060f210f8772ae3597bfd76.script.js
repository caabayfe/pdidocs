/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({
    api
}) {
    var items = [{
        "id": "copyLink",
        "label": api.state.copyLinkLabel
    }];
    return items;
}
