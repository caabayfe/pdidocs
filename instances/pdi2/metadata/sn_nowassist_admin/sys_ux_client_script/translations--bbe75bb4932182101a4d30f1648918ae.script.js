/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const skill_config_title = api.context.props.payload.guided_context.skill_config_title;
    api.setState("review_step_in_product_card_title",await helpers.translate("Will {0} display in product?", skill_config_title ? skill_config_title.toLowerCase() : ""));
    api.setState("review_step_nap_card_title",await helpers.translate("Will {0} display in Now Assist panel?", skill_config_title ? skill_config_title.toLowerCase() : ""));
    api.setState("review_step_in_mobile_card_title",await helpers.translate("Will {0} display in mobile?", skill_config_title ? skill_config_title.toLowerCase() : ""));
    api.setState("review_step_nacm_display_title", await helpers.translate("Will {0} display in Now Assist context menu?", skill_config_title ? skill_config_title.toLowerCase() : ""));
}
