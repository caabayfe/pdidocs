/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {

    // Condition to show user_name or hashed_user_id 
    const userColumn = api.data.show_hashed_user_id_1.output == "true" ? 'hashed_user_id' : 'user_name';
    const columns = `user_index,${userColumn},instance_name,first_conversation,last_conversation,time_on_chat,last_used_channel,last_used_language,favorite`;
    return columns;

}
