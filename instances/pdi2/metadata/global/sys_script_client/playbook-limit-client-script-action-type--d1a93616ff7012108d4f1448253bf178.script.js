function onLoad() {
    var actionModel = g_form.getValue('model');
	var playbookActionModel = '16f2aef6c32110109b1204186e40dd7f';
	var stageActionModel = '61cd5e20c30210109b1204186e40ddb0';
    //hide client_script value for playbook and stage action model
    if (actionModel === playbookActionModel || actionModel === stageActionModel) {
        g_form.removeOption('declarative_action_type', 'client_script');
    }
}
