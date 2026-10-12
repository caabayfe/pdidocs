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
    var GLIDE_ENCRYPTER = "7d7ee9e3b7030010ebf7082e7e11a979";
    var CLE_PARENT_MODULE = "620aed380b233300af4deaf1a3673a09";
    var CM_CLIENT_CK = "7e05b165c72201109d59fa49f4c26044";
    var CM_INSTANCE_CK = "56b551d3b71101109d592bc1de11a939";

    var results = api.data.cm.output.data.GlideRecord_Query.sys_kmf_crypto_module._results;
    if (0 == results.length)
        return null;

    var module = results[0];
    api.data.pwd2_config.refresh();

    var sysId = module._row_data.uniqueValue;

    // If it's the parent Password2 module, access is wide open.
    if (GLIDE_ENCRYPTER == sysId)
        api.setState("is_legacy_encrypter", true);

    var moduleType = "unknown";
    var parentModuleId = module.parent_crypto_module.value;
    switch (parentModuleId) {
        case GLIDE_ENCRYPTER:
            moduleType = "password2";
            break;
        case CLE_PARENT_MODULE:
            moduleType = "column_level_encryption";
            break;
        case CM_CLIENT_CK:
        case CM_INSTANCE_CK:
            moduleType = "sg_conceptual";
            break;
    }
    api.setState("moduleType", moduleType);
}
