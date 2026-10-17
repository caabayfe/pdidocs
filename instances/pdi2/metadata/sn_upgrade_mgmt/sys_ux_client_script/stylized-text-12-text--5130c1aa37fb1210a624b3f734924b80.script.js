/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	function getLocalDateOrDash(cloneStartTime) {
        if (!cloneStartTime) {
            return "-"; // Return '-' if the value is null or undefined
        }

        // Convert to a Date object (assumes the string is in UTC)
        const utcDate = new Date(cloneStartTime + " UTC");

        // Check if the date is valid
        if (isNaN(utcDate.getTime())) {
            return "-"; // Return '-' if the date is invalid
        }

        // Convert to local time string
        return utcDate.toLocaleString(); // Formats the date in the user's local timezone
    }
    return getLocalDateOrDash(api.state.lastCloneSummary.endTime);
}
