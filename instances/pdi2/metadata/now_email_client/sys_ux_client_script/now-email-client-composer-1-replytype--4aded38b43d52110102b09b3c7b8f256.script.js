/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
    if(api.context.props.replyType) {
      return api.context.props.replyType;
    }

    if(api.state.params.replyType) {
      return api.state.params.replyType;
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
      return params["replyType"];
    }
}
