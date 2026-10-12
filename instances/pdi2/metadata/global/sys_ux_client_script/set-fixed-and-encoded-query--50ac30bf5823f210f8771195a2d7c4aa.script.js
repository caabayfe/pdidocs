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
        const existingEncodedQuery = api.context?.props?.encodedQuery;

        if (output.data.errorCodeSysId && (!existingErrorCode || existingErrorCode.trim() === ""))
            api.setState("fixed_query", "refined_error_code=" + output.data.errorCodeSysId);

        if (output.data.encodedQuery && (!existingEncodedQuery || existingEncodedQuery.trim() === ""))
            api.setState("encoded_query", output.data.encodedQuery);
    }
}
