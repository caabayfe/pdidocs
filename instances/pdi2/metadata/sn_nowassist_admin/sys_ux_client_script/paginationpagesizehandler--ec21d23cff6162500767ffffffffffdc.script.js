/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        SkillOperationUtil
    } = imports['sn_nowassist_admin.SkillOperationUtil']();

    switch (event.elementId) {
        case 'pagination_control_card':
            api.setState('cardItemsPerPage', event.payload.value);
            var {
                skillCardPaginatedData
            } = SkillOperationUtil.setInitialPaginationSkill(api.state.skillCardData, api.state.skillListData, 0, event.payload.value, api.state.listItemsPerPage);
            api.setState('skillCardPaginatedData', skillCardPaginatedData);
            break;

        case 'pagination_control_list':
            api.setState('listItemsPerPage', event.payload.value);
            var {
                skillCardPaginatedData, skillListPaginatedData
            } = SkillOperationUtil.setInitialPaginationSkill(api.state.skillCardData, api.state.skillListData, 0, api.state.cardItemsPerPage, event.payload.value);
            api.setState('skillCardPaginatedData', skillCardPaginatedData);
            api.setState('skillListPaginatedData', skillListPaginatedData);
            var isEnabledRowDefinitions = { ...api.state.allSkillData.presentationListRowPayload,
                rows: skillListPaginatedData
            };
            api.setState('isEnabledRowDefinitions', isEnabledRowDefinitions);
            break;
            
        default:
            break;
    }


    api.setState('skillCardPaginatedData', skillCardPaginatedData);
}
