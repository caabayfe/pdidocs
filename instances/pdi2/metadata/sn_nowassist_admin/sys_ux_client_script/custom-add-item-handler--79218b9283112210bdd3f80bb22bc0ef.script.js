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

    var selectionType= (event.elementId == 'add_oob_skill_group_button') ? 'oobSkillGroup' : 'oobSkill';
    var selectedItems = api.state.customSelectedItems;
    api.setState('disableSaveAndActive', true);
    selectedItems.push({
        task: Date.now(),
        selectionType: selectionType,
        showFnGroupSkillList: false,
        relatedSkills:[],
        capabilityList: [],
        azureConsentPassed: false,
      providers:[],
      skillStatus :  "",
      skillList : [],
      showIntruptionModalGroupSkillList: false

    });
    api.setState('customSelectedItems', JSON.parse(JSON.stringify(selectedItems)));

}
