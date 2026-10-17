function handler({api, event, imports, helpers}) {
	const { modal } = helpers;
	modal.close("[component-id$='item_modal']");
	if(api.state.itemModalSelectedValue === "FROM_TEMPLATE") {
		helpers.navigate.to("bridge",{},{});
	} else {
		helpers.navigate.to("wizard",{
			sysId: '38f351fe73221010c84e2bb43cf6a7ad'
		},{
			mode: 'normal',
			recordId: '',
			templateId: ''
		});
	}
	api.setState('itemModalSelectedValue', 'FROM_TEMPLATE');
}
