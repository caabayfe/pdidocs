/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {

    // User id or Hashed User Id shown on the basis of condition
    const userColumn = api.data.show_hashed_user_id_1.output == "true" ? 'conversation.consumer.user_id.hashed_user_id' : 'conversation.consumer.user_id.user_name';
    const columns = `conversation.sys_created_on,duration,${userColumn},conversation.device_type,language,end_state,type,favorite,conversation`;
    return columns;

}
