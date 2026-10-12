function handler({api, event, imports,helpers}) {
   const { snHttp, modal, screen,  } = helpers;
	api.setState('itemModalSelectedValue', 'FROM_TEMPLATE');
	const { catalog_builder_editor_blank_template = false } = api.data.builder_roles.output;
	const { catalog_builder_editor = false } = api.data.builder_roles.output;
	if (catalog_builder_editor_blank_template) {
		modal.open("[component-id$='item_modal']");
	} else if (catalog_builder_editor) {
		api.emit("NAV_ITEM_SELECTED", { route: "selector", title: "Template Selection"});
	}
	else {
		console.error('Neither builder nor blank template user');
	}
}
