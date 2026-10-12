/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
    if(api.context.props.parentSysId) {
      return api.context.props.parentSysId;
    }

    if(api.state.params.parentSysId) {
      return api.state.params.parentSysId;
    }

    if(api.context.props.extraParams) {
      const extraParams = api.context.props.extraParams.split('/');
      const params = extraParams.reduce((result, currentValue, currentIndex, arr) => {
              if (currentIndex % 2 != 0) {
                  result[arr[currentIndex - 1]] = currentValue;
              }
              return result;
          },
          {}
      );
      return params["parentSysId"];
    }
}
