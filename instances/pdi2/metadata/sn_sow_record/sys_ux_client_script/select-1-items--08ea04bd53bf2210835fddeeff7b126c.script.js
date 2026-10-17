/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({
    api,
    helpers
}) {
    let wrapUpCodes = api.data.wrap_up.allowedWrapUpCodes;
    wrapUpCodes = wrapUpCodes.map((item) => {
        return { ...item,
            id: item.id + item.label
        };

    });
    return wrapUpCodes;
}
