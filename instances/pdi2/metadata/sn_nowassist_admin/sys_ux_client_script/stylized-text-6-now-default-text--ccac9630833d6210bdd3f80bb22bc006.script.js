/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
 const currentSkill  =  api?.state?.interdependent_skills?.currentSkill;
	return helpers.translateSync("You are opting to change the provider for {currentSkillLabel}. Changing the {currentSkillLabel} skill model provider will also affect the following skills, as they are interdependent. Selecting any provider from the list will change model provider for all;",{currentSkillLabel: currentSkill?.label});
}
