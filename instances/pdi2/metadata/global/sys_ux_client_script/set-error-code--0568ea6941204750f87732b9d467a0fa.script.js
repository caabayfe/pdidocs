/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({ api, event, helpers, imports }) {
    const output = api.data.ef_error_stats_query_transform?.output;

    if (!output)
        return;

    if (output.success && output.data) {
        const existingErrorCode = api.context?.props?.errorCode;

        let finalErrorCode = "";

        if (existingErrorCode && existingErrorCode.trim() !== "")
            finalErrorCode = existingErrorCode;
        else if (output.data.errorCodeSysId)
            finalErrorCode = output.data.errorCodeSysId;

        if (finalErrorCode)
            api.setState("error_code_sysid", finalErrorCode);
    }
}
