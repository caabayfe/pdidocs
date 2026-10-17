/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {

    var finalText = "";
    var summary_data = api.data.sc_get_summary_score_details__1.output[0];
    var prev_score = summary_data.prevScore;
    var curr_score = summary_data.currScore;
    var change_from_prev = summary_data.changeFromPrev;
    var arrow_direction = summary_data.arrowDirection;
    var updated_settings = summary_data.updatedSettings;

    var inc_dec_text = "not changed";
    if (change_from_prev && arrow_direction && arrow_direction == "up") {
        inc_dec_text = "increased " + change_from_prev + "%";
    } else if (change_from_prev && arrow_direction && arrow_direction == "down") {
        inc_dec_text = "decreased " + change_from_prev + "%";
    }

    if (updated_settings == "0") {
        var score = Math.round(curr_score);
        if (score >= 90) {
            return "Your score is Excellent.";
        } else if (score >= 80 || score < 90) {
            return "Your score is in a good shape.";
        } else {
            return "Your score needs improvement.";
        }
    }
    var affectedSecArea = summary_data.securityArea;
    var affectedPriority = summary_data.priority;

    var secAreaText = "";
    if (affectedSecArea && affectedSecArea.length == 1) {
        secAreaText = affectedSecArea[0];
    } else if (affectedSecArea && affectedSecArea.length == 2) {
        secAreaText = affectedSecArea[0] + " and " + affectedSecArea[1];
    } else if (affectedSecArea && affectedSecArea.length == 3) {
        secAreaText = affectedSecArea[0] + " , " + affectedSecArea[1] + " and " + affectedSecArea[2];
    } else {
        secAreaText;
    }

    var priorityText = "";
    if (affectedPriority) {
        var count = 0;
        var length = Object.keys(affectedPriority).length;
        for (var pr in affectedPriority) {
            priorityText = priorityText + affectedPriority[pr] + " " + pr.split(" - ")[1];
            count++;
            if (length > count) {
                priorityText = priorityText + " , ";
            }
        }
    }

    if (updated_settings != "0" || secAreaText != "" && priorityText != "") {
        finalText = helpers.translateSync("The security area most affected is {0} with {1} settings.", secAreaText, priorityText);
    }

    return finalText;
}
