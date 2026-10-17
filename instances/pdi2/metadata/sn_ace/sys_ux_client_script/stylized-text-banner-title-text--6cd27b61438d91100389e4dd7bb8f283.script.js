/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {

    if (api.context.props.payload && api.context.props.payload.title) {
      return api.context.props.payload.title;
    }

  return '';
}
