/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.data.record_information__request_1.output && api.data.record_information__request_1.output.assignmentInfo) {
        var assignmentInfo = api.data.record_information__request_1.output.assignmentInfo;
        if (assignmentInfo.assignmentGroup && assignmentInfo.assignedTo)
            return helpers.translateSync("Reassign");

        if (assignmentInfo.assignmentGroup) {
            if (assignmentInfo.loggedInUserHasAssignmentGroup)
                return helpers.translateSync("Assign to me");
            else
                return helpers.translateSync("Assign");
        }

        if (assignmentInfo.assignedTo)
            return helpers.translateSync("Reassign");

        return helpers.translateSync("Assign to me");
    }
}
