function handler({
    api,
    helpers,
    event
}) {
    const {setTimeout, clearTimeout} = helpers.timing;
    const {shouldRefresh = false} = event.payload || {};

   // Minimum update rate is 5 seconds
    const secondsToUpdate = (api.context.props.updateInterval &&  api.context.props.updateInterval >= 5) ?  api.context.props.updateInterval : 5;

    // Convert to ms.
    const delay = secondsToUpdate * 1000;

    api.setState('refreshTimeout', ({ currentValue: refreshTimeout, api }) => {

        //Check if a timer for the current event name already exist
        if (refreshTimeout && !shouldRefresh)
            return refreshTimeout;

        if (refreshTimeout && shouldRefresh)
            clearTimeout(refreshTimeout);

        const {changeTypes: changeTypesInput} = api.context.props;
        if (!changeTypesInput)
            return;

        //Start timeout
        const newTimer = setTimeout(() => {
            const {isFirstTime} = api.state;
            const {output: lastResult} = api.data.service_map_is_changed;

            if (isFirstTime) {

                const changeTypes = {
                    types: Object.fromEntries(
                        changeTypesInput.split(',').map(key => [key, -1])
                    )
                };

                api.setState('changeTypes', changeTypes);

            } else if (!lastResult) //in case of first time or failure (logout etc.)
                api.data.service_map_is_changed.refresh();

            else
                api.setState('changeTypes', lastResult);

            api.setState('refreshTimeout', null); //reset debounce state
        }, delay);

        return newTimer;
    });
}
