/**
 * Check where to get the correct highlighted values config id for the gform data broker
 */
function getGformDatabrokerHighlightedValueConfigId ({ api }) {
  return api.context.props.overrideAppContextConfigIds === true ? api.context.props.highlightedValueConfigId : api.context.app.highlightedValueConfigId;
}
