/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    var item = [{
        message: await helpers.translate("Summary copied to clipboard"),
        type: "success"
    }];

    function stripHtmlRegex(html) {
        return html.replace(/<[^>]*>/g, '');
    }
    helpers.timing.setTimeout(function() {
        var summarizedText = api.state.summarizedText ? stripHtmlRegex(api.state.summarizedText) : '';
        this.navigator.clipboard.writeText(summarizedText).then(() => {
            // Emitting event for notification on side panel
            api.emit("SN_GUIDANCE#ADD_NOTIFICATIONS", {
                items: item
            });
            // Emitting event for notification on expanded search tab
            api.emit("SN_SEARCH_RESULTS_CONTAINER#DECLARATIVE_ACTION", {
                event: "RA_EXPANDED_SEARCH#ADD_NOTIFICATION",
                payload: {
                    items: item
                }
            });
            //Emitting event for logging AI search results ,actionData is optional

            api.emit('LOG_SEARCH_RESULT_EVENT', {
                actionData: {
                    actionName: "COPY_SUMMARY"
                }
            });
        });

    }, function(err) {
        console.log('Error occurred when trying to copy link to clipboard. ', err);
    });
    api.emit('MACROPONENT_TRACK_USAGE_REQUESTED', {
        event: "Click - Copy summary",
        value: {
            "Guidance": "Show genius result"
        }
    });
}
