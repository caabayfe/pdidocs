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
    if (!api.context.props.start) return;

    let duration = Number(api.context.props.duration);
    if (isNaN(duration)) return;
    duration = Math.floor(duration);

    //initial timer set
    formatTime();

    // timer set after every 1 sec
    const intervalID = helpers.timing.setInterval(formatTime, 1000);

    // clear timer after duration is elapsed
    helpers.timing.setTimeout(stopTimer, duration * 1000);

    function formatTime() {
        duration -= 1;
        if (duration < 0) return;
        let seconds = Math.floor(duration % (60));
        seconds = (Math.floor(seconds / 10) === 0) ? ("0" + seconds) : seconds;
        let minutes = Math.floor((duration / 60));
        minutes = (Math.floor(minutes / 10) === 0) ? ("0" + minutes) : minutes;
        api.setState("timer",  api.context.props.placeholderText.replace("{0}", minutes).replace("{1}", seconds));
    };

    function stopTimer() {
        helpers.timing.clearInterval(intervalID);
        // emitting event on timer completed for consumer to handle as required
        api.emit("PWD_RESET_UIB#TIME_COMPLETED");
    };
}
