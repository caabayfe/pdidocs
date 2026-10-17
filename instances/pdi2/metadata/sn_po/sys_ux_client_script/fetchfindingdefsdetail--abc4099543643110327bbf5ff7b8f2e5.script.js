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
    let {
        automatedFindingsCount,
        findingsCount,
        projectEntities
    } = api.data.get_project_details_1.output.data.GlidePromin_Query.projectConfiguration;;
    automatedFindingsCount = parseInt(automatedFindingsCount);
    findingsCount = parseInt(findingsCount);

    const {
        projectInfo: {
            isShared,
            permissions: {
                promin_project,
            },
        },
    } = api.data.get_project_info.output.data.snPo.GlidePromin.getProjectInfo;

    api.setState('totalFindingsCount', automatedFindingsCount + findingsCount);
    api.setState('ruleBasedFindingsCount', findingsCount);
    api.setState('automatedFindingsCount', automatedFindingsCount);

    if (automatedFindingsCount + findingsCount == 0) {
        api.setState('overlayMessage', {
            "type": "message",
            "showColumnHeaders": true,
            "messageConfig": {
                "actions": [{
                    "label": await helpers.translate("Add from library"),
                    "variant": "primary",
                    "disabled": isShared || !promin_project.canWrite,
                    "clickActionType": "NOW_TEMPLATE_MESSAGE_EMPTY_STATE#ACTION_CLICKED"
                }],
                "heading": {
                    "level": 1
                },
                "illustration": "add-data"
            }
        });
        api.setState('selectedFindingsCount', await helpers.translate('Select from available templates, or you can create a new finding definition.'));
    } else {
        api.setState('overlayMessage', {});
        api.setState('selectedFindingsCount', await helpers.translate('Rule based: ({0}), Automated: ({1})', findingsCount, automatedFindingsCount));
        api.setState('totalAppliedtext', await helpers.translate('Total finding definitions applied: {0}', automatedFindingsCount + findingsCount));
    }
}
