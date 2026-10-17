function handler({api, event, imports,helpers}) {
   const { snHttp, modal, screen,  } = helpers;
	
   console.log(api.data.builder_roles.output);
   const { catalog_template_editor = false } = api.data.builder_roles.output;
	if (catalog_template_editor) {
		modal.open("[component-id$='template_modal']");
	}
	else {
		console.error('Not a template editor');
	}
}
