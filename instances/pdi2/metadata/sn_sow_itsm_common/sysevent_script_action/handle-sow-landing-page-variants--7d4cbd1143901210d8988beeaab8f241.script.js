var currentEventScriptActionSysId = "7d4cbd1143901210d8988beeaab8f241";
var sowLandingPageUpgradeUtil = new SOWLandingPageUpgradeUtil();
sowLandingPageUpgradeUtil.handleVariants();
disableCurrentEventScriptAction();

function disableCurrentEventScriptAction() {
    var eventScriptActionGr = new GlideRecord('sysevent_script_action');
    if (eventScriptActionGr.get(currentEventScriptActionSysId)) {
        eventScriptActionGr.setValue('active', false);
        eventScriptActionGr.update();
        gs.info('Disabling the script action {0} ({1}) as it should only run once.', [currentEventScriptActionSysId, "Handle SOW landing page variants"]);
    }
}
