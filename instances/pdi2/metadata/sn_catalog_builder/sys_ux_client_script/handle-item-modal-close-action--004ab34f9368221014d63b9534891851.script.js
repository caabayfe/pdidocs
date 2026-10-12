function handler({api, event, helpers, imports}) {
	const {modal} = helpers;
	modal.close("[component-id$='item_modal']");
	api.setState('itemModalSelectedValue', 'STANDARD');
}
