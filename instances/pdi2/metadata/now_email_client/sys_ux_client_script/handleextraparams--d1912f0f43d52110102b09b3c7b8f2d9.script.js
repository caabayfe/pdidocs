/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api, event, helpers, imports}) {
    if(!api.context.props.extraParams) {
      return;
    }

    const extraParams = api.context.props.extraParams.split('/');
    const params = extraParams && extraParams.reduce((result, currentValue, currentIndex, arr) => {
            if (currentIndex % 2 != 0) {
                result[arr[currentIndex - 1]] = currentValue;
            }
            return result;
        },
        {}
    );

    if(params) {
      api.setState("params", params);
    }

}
