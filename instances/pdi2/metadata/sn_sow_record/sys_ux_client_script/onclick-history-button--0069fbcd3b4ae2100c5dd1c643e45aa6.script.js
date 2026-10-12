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
    api.setState('tab', 'History');
    api.setState('remedialData', {});
    api.setState('leapData', []);
    
    api.setState("loadingText", await helpers.translate("Fetching playbooks"));
    if (api.state.isRemedialActionInstalled)
        api.data.sow_remedial_action_playbook_content.refresh();
    if (api.state.isLeapInstalled){
        api.setState("leapAction", 'fetchPlaybooks');
        api.data.sow_leap_playbook_content.execute({
            parent_record_id: api.context.props.parentSysId,
            user_language: api.context.session.user.language,
            action: 'fetchPlaybooks'

        });
    }
    api.setState('historyFrames', []);
    api.setState('accordionExpanded', false);

}
