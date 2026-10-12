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
    /*
    time: Timestamp to start from / end at
    */
    // Clear the existing timer
    if (api.state.intervalId)
        helpers.timing.clearInterval(api.state.intervalId);

    const isIncremental = api.context.props.isIncremental === "true";
    const time = parseInt(api.context.props.time);

    if (isIncremental) var initialTime = Date.now() - time;
    let endTime = new Date(time);
    const intervalId = helpers.timing.setInterval(updateTimer, 1000);
    api.setState("intervalId", intervalId);

    function updateTimer() {
        let duration = 0;
        if (isIncremental) {
            initialTime += 1000;
            api.setState("duration", msToTime(initialTime));
        } else {
            duration = endTime - Date.now();
            api.setState("duration", msToTime(duration));
        }

        if (!isIncremental && duration < 1000)
            helpers.timing.clearInterval(intervalId);
    }

    function msToTime(duration) {
        if (duration < 1000)
            duration = 0;
        let seconds = Math.floor((duration / 1000) % 60),
            minutes = Math.floor((duration / (1000 * 60)) % 60),
            hours = Math.floor((duration / (1000 * 60 * 60)) % 24),
            days = Math.floor((duration / (1000 * 60 * 60)) / 24);

        hours = ("0" + hours).slice(-2);
        minutes = ("0" + minutes).slice(-2);
        seconds = ("0" + seconds).slice(-2);

        if (api.context.props.useCase == "mim_duration") {
            if (days)
                return days + "d " + hours + "hr " + minutes + "min " + seconds + "sec";
            else
                return hours + "hr " + minutes + "min " + seconds + "sec";
        } else {
            if (days)
                return days + " " + hours + ":" + minutes + ":" + seconds;
            else
                return hours + ":" + minutes + ":" + seconds;
        }

    }

}
