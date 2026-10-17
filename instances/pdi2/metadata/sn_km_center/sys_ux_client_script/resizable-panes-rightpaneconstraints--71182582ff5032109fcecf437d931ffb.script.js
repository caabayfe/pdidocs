/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  // if we haven't manually toggled the sidebar yet,
  // or we are an existing record, then we should use the default logic from the form controller
  const shouldUseRecordValue = api.state.hasToggledSidebar || api.context.props.sysId !== '-1';

	return shouldUseRecordValue ? api.data.record.sidebarPaneContraints : {minPixels: 48};
}
