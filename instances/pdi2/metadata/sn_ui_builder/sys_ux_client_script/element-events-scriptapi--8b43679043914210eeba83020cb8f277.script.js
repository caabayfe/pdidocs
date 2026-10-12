function evaluateProperty({
    api,
    helpers
}) {
    // We need to bring in the normal binding context AND any @item bindings from a modeless or repeater
	const pageContext = {
		context: {
			app: api.elements.ui_builder.resolvedContext.inputs.app,
			session: api.elements.ui_builder.resolvedContext.inputs.session,
			props: api.elements.ui_builder.resolvedContext.inputs.page.props,
		},
		data: api.elements.ui_builder.resolvedContext.outputs.page.data,
		elements: api.elements.ui_builder.resolvedContext.outputs.page.elements,
		state: api.elements.ui_builder.resolvedContext.outputs.page.state,
		elementAndDataResourceNameMaps: api.elements.ui_builder.resolvedContext.outputs.page.elementAndDataResourceNameMaps,
		// @item bindings
		...api.elements.builder_core.selectedElementSpecialBindings.bindings
	};

    return pageContext;
}
