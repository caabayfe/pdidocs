/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const expiryFromEvent =
        event && event.payload && event.payload.data &&
        event.payload.data.output && event.payload.data.output.validUntilUTC;

    if (expiryFromEvent) {
        api.setState('tokenExpiryUTC', expiryFromEvent); // persist for later triggers
    }

    // use the local value, not api.state.tokenExpiryUTC just set above (setState is async)
    const expiryTime = expiryFromEvent || api.state.tokenExpiryUTC;

    if (!expiryTime) {
        return;
    }

    if (api.state.timerId) {
        helpers.timing.clearInterval(api.state.timerId);
    }

    function tick() {
        const now = new Date().getTime();
        const diff = expiryTime - now;

        if (diff <= 0) {
            api.setState('timerValue', '00:00:00');
            helpers.timing.clearInterval(api.state.timerId);
            return;
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        const formatted =
            String(hours).padStart(2, '0') + ':' +
            String(minutes).padStart(2, '0') + ':' +
            String(seconds).padStart(2, '0');

        api.setState('timerValue', formatted);
    }

    tick();
    api.setState('timerId', helpers.timing.setInterval(tick, 1000));
}
