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
    // Handle property change events from the macroponent
    if (event.name === "MACROPONENT_PROPERTY_CHANGED") {
        // Ignore color changes as they don't affect timer functionality
        if (event.payload.name === "color") return;
        // Handle changes to the incremental mode (count-up vs count-down)
        if (event.payload.name === "isIncremental") {
            // Only update if the value has actually changed
            if (event.payload.value !== api.state.isIncremental) {
                api.setState("isIncremental", event.payload.value );
                // If changing from incremental to non-incremental, don't proceed further
                if (event.payload.previousValue === true && event.payload.value === false) return;
            }
        }
    }

    // Clear any existing interval to prevent memory leaks
    if (api.state.intervalId) {
        helpers.timing.clearInterval(api.state.intervalId);
        api.setState("intervalId", null);
    }

    // Exit early if no time is provided
    if (!api.context.props.time) return;

    // Initialize timer properties
    const isIncremental = api.context.props.isIncremental;
    const time = parseInt(api.context.props.time);
    let intervalId = null;

    // Initial timer update to set the display
    const currentTime = Date.now();
    const currentUTCTime = currentTime + new Date().getTimezoneOffset() * 60 * 1000;
    let timeValue = isIncremental ? currentUTCTime - time : time - currentUTCTime;
    timeValue = Math.floor(timeValue / 1000);


    updateTimer();
    if (api.context.props.startTimer) {
        intervalId = helpers.timing.setInterval(updateTimer, 1000);
        api.setState("intervalId", intervalId);
    }

    /**
     * Updates the timer display and checks for completion
     * This function is called every second when the timer is running
     */
    function updateTimer() {
        if (isIncremental) {
            timeValue += 1;
            api.setState("duration", msToTime(timeValue));
        } else {
            timeValue -= 1;
            api.setState("duration", msToTime(timeValue));
            // Check if countdown has reached zero
            if (timeValue < 1) {
                // Clean up the interval
                if (intervalId) {
                    helpers.timing.clearInterval(intervalId);
                    intervalId = null;
                    api.setState("intervalId", intervalId);
                }
                // Notify that the countdown has completed
                emitTimerComplete();
            }
        }
    }

    /**
     * Emits an event when the countdown timer reaches zero
     * This notifies other components that the countdown has finished
     */
    function emitTimerComplete() {
        api.emit('NOTIFY_UIB#TIMER_COMPLETED', {
            isIncremental: false
        });
    }

    /**
     * Converts a duration in seconds to a formatted time string (DD:HH:MM:SS)
     * @param {number} duration - Duration in seconds
     * @returns {string} Formatted time string (e.g., "01:23:45" or "2:01:23:45" for days)
     */
    function msToTime(duration) {
        duration = Math.max(0, duration);
        let seconds = Math.floor(duration % 60),
            minutes = Math.floor((duration / 60) % 60),
            hours = Math.floor((duration / (60 * 60)) % 24),
            days = Math.floor((duration / (60 * 60)) / 24);

        hours = hours < 10 ? "0" + hours : hours;
        minutes = ("0" + minutes).slice(-2);
        seconds = ("0" + seconds).slice(-2);

        let currentTimer = hours + ":" + minutes + ":" + seconds;
        if (days > 0) currentTimer = days + ":" + currentTimer;
        return currentTimer;
    }

}
