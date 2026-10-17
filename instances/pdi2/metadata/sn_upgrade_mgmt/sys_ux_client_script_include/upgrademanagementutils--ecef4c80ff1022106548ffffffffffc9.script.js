function include({ imports }) {

    function convertDateFormat(dateStr) {
        if (dateStr === null || dateStr === undefined) {
            return "Invalid date string";
        }
        var dateObj = new Date(dateStr);
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

    /**
     * Log a message to the syslog table via data broker.
     * @param {object} api - The macroponent api object
     * @param {string} scriptName - Name of the calling script/module
     * @param {string} message - Log message
     * @param {Error} [error] - Optional error object from catch block
     */
    function log(api, scriptName, message, error) {
        try {
            var msg = message || "";
            if (error) {
                msg += (msg ? " | " : "") + (error.message || String(error));
            }
            api.setState("_logPayload", JSON.stringify({
                source: scriptName,
                message: msg,
                level: "error"
            }));
            if (api.data && api.data.log_client_error) {
                api.data.log_client_error.refresh();
            }
        } catch (e) {
            // Silent fail - logging should never break the caller
        }
    }

    return {
        convertDateFormat,
        log
    }
}
