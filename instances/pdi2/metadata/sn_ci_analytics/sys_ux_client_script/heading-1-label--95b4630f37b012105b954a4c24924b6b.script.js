/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {

    // Returning title based on the "show hashed user id" value
    const title = api.data.show_hashed_user_id_1.output == "true" ? 'Hashed User ID' : 'User ID';
    return title;
}
