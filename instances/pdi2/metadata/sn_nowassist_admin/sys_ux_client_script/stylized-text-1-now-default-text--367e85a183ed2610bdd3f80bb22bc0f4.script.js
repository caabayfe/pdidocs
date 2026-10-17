/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var type = (api.item.value.selectionType == 'oobSkillGroup') ? helpers.translateSync('Skill group') : helpers.translateSync('Skill');
  var text = (api.item.index+ 1) || '1';
	return '#'+text + '.' + type;
}
