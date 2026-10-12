/**
 * Refreshes the wrap-up timer when the segment's wrap_up_configuration changes
 * mid-wrap-up. Triggered by get_config_by_segment_id.DATA_OP_SUCCEEDED, which is
 * re-executed by the segment record-watcher event mapping when CCaaS swaps the
 * configuration reference.
 *
 * Anchors the countdown to segment.refreshed_on, which the backend sets to now()
 * on each config-only refresh, so a page refresh resumes from the same elapsed
 * time as Initiate or Continue Wrap Up.
 *
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {ApiHelpers} params.helpers
 */
function handler({ api, event, helpers }) {
    if (!api.state.isOpenWrapUpForCurrentUser) { return; }

    const segmentById = event?.payload?.data?.output?.data?.now?.wrapUpSegment?.segmentById;
    if (!segmentById || !segmentById.success) { return; }

    const segment = segmentById?.segment;
    const wrapUpConfig = segment?.wrap_up_configuration;
    if (!wrapUpConfig) { return; }

    // Guard against AMB re-fires for unrelated segment writes (END_WRAP_UP, ai_notes,
    // etc.). Snapshot timer-relevant config fields so we restart whether CCaaS swapped
    // the config reference or mutated values on the same record.
    const snapshot = wrapUpConfig.sys_id + "|" + wrapUpConfig.duration + "|" + wrapUpConfig.enforce_duration + "|" + wrapUpConfig.show_timer;
    if (snapshot === api.state.wrapUpConfigSnapshot) { return; }
    api.setState("wrapUpConfigSnapshot", snapshot);

    const duration = parseInt(wrapUpConfig.duration, 10);
    const isTimerEnabled = wrapUpConfig.enforce_duration;
    const showTimer = wrapUpConfig.show_timer;

    if (api.state.timer) {
        helpers.timing.clearInterval(api.state.timer);
        api.setState("timer", null);
    }

    if (!isTimerEnabled) {
        api.setState("timerEnabled", false);
        return;
    }

    api.setState("timerDuration", duration);
    api.setState("timerEnabled", true);
    api.setState("showTimer", showTimer);

    // Anchor to segment.refreshed_on (set to now() by the backend on config-only refresh)
    // so the live-update anchor matches what Initiate or Continue Wrap Up uses on a
    // subsequent page refresh. The dash-to-slash replace is for Safari (DEF0679821).
    const timerStartedAt = segment.refreshed_on
        ? new Date(segment.refreshed_on.replace(/-/g, "/") + " UTC").getTime()
        : new Date().getTime();
    const timerDurationMs = duration * 1000;

    const secondToTimeFormat = sec_num => {
        let hours = Math.floor(sec_num / 3600);
        let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        let seconds = sec_num - (hours * 3600) - (minutes * 60);
        if (hours < 10) hours = "0" + hours;
        if (minutes < 10) minutes = "0" + minutes;
        if (seconds < 10) seconds = "0" + seconds;
        return hours + ":" + minutes + ":" + seconds;
    };

    const timerColors = ["high", "warning", "positive", "positive"];

    let timer;
    // Math.ceil absorbs setInterval drift so 30 → 29 → 28 doesn't skip a second.
    const tick = () => {
        const currentMs = new Date().getTime();
        const timeLeft = Math.ceil((timerStartedAt + timerDurationMs - currentMs) / 1000);
        api.setState("timeLeftInSecond", timeLeft);
        if (timeLeft <= 0) {
            helpers.timing.clearInterval(timer);
            api.emit("WRAP_UP#END_WRAP_UP", {});
            return;
        }
        const currentColorIndex = Math.floor(timeLeft * 1000 / timerDurationMs * timerColors.length);
        api.setState("timerLabel", secondToTimeFormat(timeLeft));
        api.setState("timerColor", timerColors[currentColorIndex]);
    };
    tick(); // fire once immediately so the label appears without the 1s setInterval delay
    timer = helpers.timing.setInterval(tick, 1000);
    api.setState("timer", timer);
}
