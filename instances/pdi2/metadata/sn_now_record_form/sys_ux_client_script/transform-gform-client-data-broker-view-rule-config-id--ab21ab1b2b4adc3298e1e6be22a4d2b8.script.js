/**
 * Check where to get the correct view rule config id for the gform data broker
 */
function getGformDatabrokerViewRuleConfigId ({ api }) {
  return api.context.props.overrideAppContextConfigIds === true ? api.context.props.viewRuleConfigId : api.context.app.viewRuleConfigId;
}
