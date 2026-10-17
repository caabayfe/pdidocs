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
    if (api.data.record_information__request_1.output && api.data.record_information__request_1.output.assignmentInfo) {
        var modalOpen = (api, modalTitle) => {
            api.emit('MACROPONENT_VIEWPORT_LOAD_REQUESTED', {
                viewportElementId: 'modal_viewport',
                route: 'sowformmodalv2',
                fields: {
                    table: api.context.props.table,
                    sysId: api.context.props.sysId,
                    title: '',
                    view: 'sow_incident_assign_modal'
                },
                params: {
                    'parentFormFields': JSON.stringify(api.context.props.fields),
                    'isGFormSave': 'true',
                    'modalTitle': modalTitle
                }
            });
        };

        var title = '';
        var assignToMeActionSysId = '8513fcd0773b301027aae297cd5a9968';

        var assignmentInfo = api.data.record_information__request_1.output.assignmentInfo;
        if ((assignmentInfo.assignmentGroup && assignmentInfo.assignedTo)) {
            title = await helpers.translate('Reassign');
            modalOpen(api, title);
        } else if (assignmentInfo.assignmentGroup) {
            if (assignmentInfo.loggedInUserHasAssignmentGroup) {
                api.emit('SOW_RECORD_UI_ACTION#EXECUTE_UI_ACTION', {
                    actionSysId: assignToMeActionSysId
                });
            } else {
                title = await helpers.translate('Assign');
                modalOpen(api, title);
            }
        } else if (assignmentInfo.assignedTo) {
            title = await helpers.translate('Reassign');
            modalOpen(api, title);
        } else {
            api.emit('SOW_RECORD_UI_ACTION#EXECUTE_UI_ACTION', {
                actionSysId: assignToMeActionSysId
            });
        }
    }
}
