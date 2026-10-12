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
    var repeaterItems = api.state.customSelectedItems;
    api.setState('disableSaveAndActive', true);
    var removedItemIndex = event.context.item.index;
    if (repeaterItems && repeaterItems.length && removedItemIndex > -1) {
        repeaterItems = repeaterItems.filter(item => repeaterItems.indexOf(item) !== removedItemIndex)
    }
    if(repeaterItems.length ==0 ){
        api.setState('filteredSkillList',[]);
      api.setState('filteredSkillListCount',0);
    }

    api.setState('disableSaveAndActive', isValidUserActions(repeaterItems))    
    api.setState('customSelectedItems', JSON.parse(JSON.stringify(repeaterItems)));


   function isValidUserActions(repeaterItems) {
        if (repeaterItems.length == 0) {
            return true;
        }
        for (const item of repeaterItems) {
            if (item.source == 'ai-agents') {
                api.setState('disabledAgenticWorkflow', []);
                api.setState('disabledAgentList', []);
                api.setState('aiAgentList', []);
            }
            if (item.selectionType == 'oobSkillGroup' && (!item?.sys_id || !item?.selectedProvider)) {
                return true;
            } else if (item.selectionType == 'oobSkill' && (!item?.selectedProvider || item?.skillList?.length == 0)) {
                return true;
            }
        }
        return false;

    }

}
