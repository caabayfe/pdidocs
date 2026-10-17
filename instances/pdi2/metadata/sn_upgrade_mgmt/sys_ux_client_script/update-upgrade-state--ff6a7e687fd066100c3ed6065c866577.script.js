/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    let upgradeData = api.data?.upgrade_management___get_upgrade_details_1?.output?.upgradeMonitorStatusProviderDetails;
    let sessionData = api.data.look_up_multiple_records_1.results[0];

    // Handle case when no upgrade is scheduled
    if (!upgradeData || !upgradeData.state) {
        api.setState("upgradeStage", "none");
        api.setState("hideSchemaAlterStartTime", true);
        return;
    }

    function convertDateFormat(dateObj) {
        if (!dateObj || isNaN(dateObj.getTime())) {
            return "Invalid date string";
        }
        var daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        var monthsOfYear = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        var dayOfWeek = daysOfWeek[dateObj.getDay()];
        var month = monthsOfYear[dateObj.getMonth()];
        var day = dateObj.getDate();
        var year = dateObj.getFullYear();

        var hours = dateObj.getHours();
        var minutes = dateObj.getMinutes();
        var ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? "0" + minutes : minutes;

        var formattedDate = dayOfWeek + ", " + month + " " + day + ", " + hours + ":" + minutes + " " + ampm;

        return formattedDate;
    }

    function formatDate(localDate) {
        const pad = (n) => String(n).padStart(2, '0');
        const year = localDate.getUTCFullYear();
        const month = pad(localDate.getUTCMonth() + 1);
        const day = pad(localDate.getUTCDate());
        const hour = pad(localDate.getUTCHours());
        const minute = pad(localDate.getUTCMinutes());
        const second = pad(localDate.getUTCSeconds());

        return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    }

    function parsePSTDateString(dateString) {
        const dateWithOffset = dateString + "-07:00";
        return new Date(dateWithOffset);
    }

    function subtractDays(date, days) {
        let newDate = new Date(date);
        newDate.setDate(newDate.getDate() - days);
        if(newDate < new Date()) {
            return new Date(date);
        }
        return newDate;
    }

    switch (upgradeData.state) {
        case "pending":
            api.setState("upgradeStage", "Scheduled");
            api.setState("hideSchemaAlterStartTime", false);
            break;

        case "running":
        case "distUpgrade":
            api.setState("upgradeStage", "In progress");
            api.setState("hideSchemaAlterStartTime", true);
            break;

        case "complete":
            if (api.state.targetPatchId != upgradeData.toVersion) {
                api.setState("upgradeStage", "none");
                api.setState("hideSchemaAlterStartTime", true);
            } else {
                api.setState("upgradeStage", "Complete");
                api.setState("hideSchemaAlterStartTime", true);
            }
            break;

        default:
            api.setState("upgradeStage", upgradeData.state || "none");
            api.setState("hideSchemaAlterStartTime", true);
    }

    api.setState("allNodesUp", true);
    for(var i=0; i< upgradeData.nodes.length; i++) {
        if(upgradeData.nodes[i].state !== "2") {
            api.setState("allNodesUp", false);
            break;
        }
    }

    let startDate;
    if (upgradeData.scheduledUpgradeInfo.scheduledUpgradeDateTime) {
        startDate = upgradeData.scheduledUpgradeInfo.scheduledUpgradeDateTime;
    } else if(upgradeData.startDate){
        startDate = upgradeData.startDate;
    }
    if(startDate != undefined) {
        let offset = api.data?.get_timezone_name_1?.output.offset;
        const offsetAdjustedDate = parsePSTDateString(startDate);
        startDate = new Date(startDate.replace(" ", "T"));
        const alterStartDate = subtractDays(startDate, 4);
        api.setState("upgradeStart", startDate);
        if(JSON.stringify(api.state.modifiedSchemaAlterDate) === '{}') {
            api.setState("modifiedSchemaAlterDate", alterStartDate);
        }
        const startDateText = convertDateFormat(startDate);
        api.setState("upgradeStartText", convertDateFormat(startDate));
        api.setState("fixScriptFilterDate", formatDate(offsetAdjustedDate));
    }
    api.setState("upgradeEndText", convertDateFormat(new Date(upgradeData.finishDate)));
}
