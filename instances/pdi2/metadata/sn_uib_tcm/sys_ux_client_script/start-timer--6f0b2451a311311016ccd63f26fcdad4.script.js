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

    if (!api.context.props.time) return;
    const isIncremental = api.context.props.isIncremental === "true";
    const time = parseInt(api.context.props.time);
    const currentUTCTime = Date.now();
    if (isIncremental) var initialTime = currentUTCTime - time;
    var endTime = time - currentUTCTime;
    var previous = Date.now();
    const intervalId = helpers.timing.setInterval(updateTimer, 1000);
    updateTimer();
    api.setState("intervalId", intervalId);

    function updateTimer() {
        if (isIncremental) {
            initialTime += (Date.now() - previous);
            api.setState("duration", msToTime(initialTime));
        } else {
            endTime -= (Date.now() - previous);
            api.setState("duration", msToTime(endTime));
        }
        if (!isIncremental && endTime < 1000)
            helpers.timing.clearInterval(intervalId);
    }

    function msToTime(duration) {
        if (duration < 1000) {
            duration = 0;
            if (!isIncremental) api.emit('TCM_UIB#TIMER_COMPLETED', {
                isIncremental
            });
        }

        let seconds = Math.floor((duration / 1000) % 60),
            minutes = Math.floor((duration / (1000 * 60)) % 60),
            hours = Math.floor((duration / (1000 * 60 * 60)) % 24),
            days = Math.floor((duration / (1000 * 60 * 60)) / 24);
        if (hours < 10) {
            hours = ("0" + hours);
        }
        minutes = ("0" + minutes).slice(-2);
        seconds = ("0" + seconds).slice(-2);
        var currentTimer = hours + ":" + minutes + ":" + seconds;
        if (days) currentTimer = days + ":" + currentTimer;
        previous = Date.now();
        return currentTimer;
    }

}
