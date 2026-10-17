/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
    if(api.context.props?.templateId) {
      return {
          templateSysId: api.context.props.templateId
      };
    }

    if(api.context.props?.extraParams) {
      const extraParams = api.context.props.extraParams.split('/');
      const params = extraParams.reduce((result, currentValue, currentIndex, arr) => {
              if (currentIndex % 2 != 0) {
                  result[arr[currentIndex - 1]] = currentValue;
              }
              return result;
          },
          {}
      );
      return 'templateId' in params ? {
          templateSysId: params["templateId"]
        } : {};
    }

    return {};
}
