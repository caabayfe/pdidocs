/**
 * Check where to get the correct ribbon config id for the gform data broker
 */
function getGformDatabrokerRibbonConfigId ({ api }) {
  return api.context.props.overrideAppContextConfigIds === true ? api.context.props.ribbonConfigId : api.context.app.ribbonConfigId;
}
