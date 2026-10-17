/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    // Displaying title based on condition
    const title = api.data.show_hashed_user_id_2.output == "true" ? 'Hashed User ID' : 'User ID';
    return title;
}
