function handler({api, event, helpers, imports}) {
	const { modal } = helpers;
	modal.close("[component-id$='template_modal']");
	api.setState('templateModalSelectedValue', 'STANDARD');
	}
