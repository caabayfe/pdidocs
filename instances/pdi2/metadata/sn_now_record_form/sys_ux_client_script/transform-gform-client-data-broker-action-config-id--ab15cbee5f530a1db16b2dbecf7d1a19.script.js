/**
 * Check where to get the correct action config id for the gform data broker
 */
function getGformDatabrokerActionConfigId ({ api }) {
  return api.context.props.overrideAppContextConfigIds === true ? api.context.props.actionConfigId : api.context.app.actionConfigId;
}
