/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
    if(api.context.props.replyId) {
      return api.context.props.replyId;
    }

    if(api.state.params.replyId) {
      return api.state.params.replyId;
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
      return params["replyId"];
    }
}
