/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var docUrl = api?.data?.look_up_a_single_record?.result?.check?._reference.documentation_url?.displayValue;

    return docUrl ?
        '<p><span style="color: rgb(0, 0, 0);"><a href="' + docUrl + '" target="_blank" rel="noopener noreferrer">' + docUrl + '</a></span></p>' :
        '';

}
