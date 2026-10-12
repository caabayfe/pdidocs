/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        tab,
        currentFrame,
        historyFrames,
        isLeapInstalled,
        isRemedialActionInstalled
    } = api.state;
    const parentSysId = api.context.props.parentSysId;
    const userLanguage = api.context.session.user.language;

    if (tab === "History" && (currentFrame === "showCards" || currentFrame === "emptyState")) {
        api.setState("tab", "Current");
        api.setState('historyFrames', []);
        api.setState('remedialData', {});
        api.setState('leapData', []);
        api.setState("loadingText", await helpers.translate("Fetching playbooks"));
        if (isRemedialActionInstalled)
            api.data.sow_remedial_action_playbook_content.refresh();
        if (isLeapInstalled){
            api.setState("leapAction", 'fetchPlaybooks');
            api.data.sow_leap_playbook_content.execute({
                parent_record_id: parentSysId,
                user_language: userLanguage,
                action: 'fetchPlaybooks'

            });
        }
        api.setState('accordionExpanded', true);
    } else {
        const frames = [...historyFrames];
        const lastFrame = frames.pop();

        api.setState('currentFrame', lastFrame);
        api.setState('historyFrames', lastFrame === "showCards" ? [] : frames);

        if (lastFrame === "showCards" && tab != 'History' && isLeapInstalled) {
            api.setState("loadingText", await helpers.translate("Fetching playbooks"));
            api.setState('leapAction', 'fetchPlaybooks');

            api.data.sow_leap_playbook_content.execute({
                parent_record_id: parentSysId,
                user_language: userLanguage,
                action: 'fetchPlaybooks'
            });
        }
        if (lastFrame === "showCards" && tab != 'History' && isRemedialActionInstalled) {
            api.setState("loadingText", await helpers.translate("Fetching playbooks"));
            api.data.sow_remedial_action_playbook_content.refresh();
        }
    }
}
