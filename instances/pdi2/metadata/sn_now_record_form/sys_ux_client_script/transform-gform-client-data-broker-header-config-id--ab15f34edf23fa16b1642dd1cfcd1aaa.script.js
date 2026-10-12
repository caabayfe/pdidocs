/**
 * Check where to get the correct header config id for the gform data broker
 */
function getGformDatabrokerHeaderConfigId ({ api }) {
  return api.context.props.overrideAppContextConfigIds === true ? api.context.props.headerConfigId : api.context.app.headerConfigId;
}
