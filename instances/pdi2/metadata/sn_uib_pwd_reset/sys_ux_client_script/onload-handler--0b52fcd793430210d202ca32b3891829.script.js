/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const pwdResetUtil = imports["sn_uib_pwd_reset.PwdResetUxfClientUtil"]();
    const {translatableItems} = api.state;
    translatableItems.confirmModal = {};
    translatableItems.confirmModal.header = await pwdResetUtil.getTranslation(helpers, "Confirm");
    api.setState(translatableItems, {...translatableItems});
}
