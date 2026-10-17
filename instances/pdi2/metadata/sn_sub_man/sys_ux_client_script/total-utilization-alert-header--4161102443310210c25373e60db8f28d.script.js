/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {

    //setting date for 2 days ago
    var d = new Date();
    d.setDate(d.getDate() - 2);
    const alertMonth = d.toLocaleDateString('default', {month: 'long'});
    const alertDay = d.getDate();
    const alertYear = d.getFullYear();
    return helpers.translateSync('Showing data as of {0} {1}, {2}.', alertMonth, alertDay, alertYear);
     
}
