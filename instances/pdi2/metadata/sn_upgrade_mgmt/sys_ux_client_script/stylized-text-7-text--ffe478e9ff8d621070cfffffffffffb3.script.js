/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    function convertDateFormat(dateObj) {
        if (!dateObj || isNaN(dateObj.getTime())) {
            return helpers.translateSync("Invalid date string");
        }

        var daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        var monthsOfYear = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        var dayOfWeek = daysOfWeek[dateObj.getDay()]; // Get the day of the week
        var month = monthsOfYear[dateObj.getMonth()]; // Get the month
        var day = dateObj.getDate(); // Get the day of the month
        var year = dateObj.getFullYear(); // Get the year

        var hours = dateObj.getHours();
        var minutes = dateObj.getMinutes();
        var ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12; // 12-hour format has 12 instead of 0
        minutes = minutes < 10 ? "0" + minutes : minutes; // Add leading zero for minutes if needed

        var formattedDate = dayOfWeek + ", " + month + " " + day + ", " + hours + ":" + minutes + " " + ampm;

        return formattedDate;
    }

    return (!api.state.scheduledUpgradeDateTime || api.state.scheduledUpgradeDateTime === 'null' ?
        helpers.translateSync('No upgrade scheduled') :
        convertDateFormat(new Date(api.state.scheduledUpgradeDateTime)));
}
