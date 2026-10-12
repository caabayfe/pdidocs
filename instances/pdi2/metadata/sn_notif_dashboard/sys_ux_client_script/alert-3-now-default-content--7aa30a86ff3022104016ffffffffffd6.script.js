/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var results = api.data.look_up_blocked_emails.results;
    var message = "";
    if (results.length == 0) {
        return "None observed ";
        ;
    }
    for (var i in results) {
        message = message.concat(results[i].email_address.displayValue)
            .concat(" (")
            .concat(results[i].fail_count.displayValue)
            .concat(" bounces) | ");
    }
    return message.substring(0, message.lastIndexOf("|"));
}
