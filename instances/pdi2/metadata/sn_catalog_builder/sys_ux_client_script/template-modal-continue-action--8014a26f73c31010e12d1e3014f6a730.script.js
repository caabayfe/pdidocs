function handler({api, event, imports, helpers}) {
	const { modal } = helpers;
	modal.close("[component-id$='template_modal']");
	if(api.state.templateModalSelectedValue === "RECORD_PRODUCER") {
		helpers.navigate.to("wizard",{
			sysId: '89bf83d4c7321010159ca1e603c260cd'
		},{
			mode: 'template',
			recordId: '',
			templateId: ''
		});
	} else {
		helpers.navigate.to("wizard",{
			sysId: '38f351fe73221010c84e2bb43cf6a7ad'
		},{
			mode: 'template',
			recordId: '',
			templateId: ''
		});
	}
	api.setState('templateModalSelectedValue', 'STANDARD');
}
