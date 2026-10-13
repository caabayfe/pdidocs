/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.imports
 */
function evaluateProperty({
    api
}) {
    const localeOutput = api.data.page_locale_parser_1.output;
    const userName = localeOutput && (api.data.show_hashed_user_id_1.output == "true" ? localeOutput.hashed_user_id : localeOutput.user_name) || '';
    return "<div>" + userName + "</div>";
}
