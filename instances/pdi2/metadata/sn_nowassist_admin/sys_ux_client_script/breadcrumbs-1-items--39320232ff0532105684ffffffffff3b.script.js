/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var list = [];
    list.push({
        "label": helpers.translateSync("Settings"),
        "id":"settings"
    });
    list.push({
        "label": helpers.translateSync("Now Assist Guardian: Prompt Injection"),
        "id":"now_assist_guardian_pi"
    });
    list.push({
        "label": helpers.translateSync("Prompt Injection"),
        "id":"prompt_injection"
    });
    return list;
}
