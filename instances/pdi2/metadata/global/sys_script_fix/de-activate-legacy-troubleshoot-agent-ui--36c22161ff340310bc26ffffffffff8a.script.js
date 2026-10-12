var uiAction = new GlideRecord('sys_ui_action');
if (uiAction.get('2bd4ab83ffc722103cadffffffffff59')) {
    uiAction.setValue('active', false);
    var result = uiAction.update();
    if (result)
        gs.info('UI Action "Triage test failure" deactivated.');
    else
        gs.warn('Failed to deactivate UI Action "Triage test failure".');
} else
    gs.warn('UI Action "Triage test failure" not found.');
