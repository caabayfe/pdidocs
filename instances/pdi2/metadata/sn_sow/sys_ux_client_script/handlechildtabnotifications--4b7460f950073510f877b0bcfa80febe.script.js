/**
    * @param {params} params
    * @param {api} params.api
    * @param {any} params.event
    * @param {any} params.imports
    * @param {ApiHelpers} params.helpers
    */
    function handler({api, event, helpers, imports}) {

        const {items = []} = event.payload;

        if (items.length > 0) {
            // accumulate notifications emitted by child pages to a local array
            api.setState('notifications', ({currentValue: notifications}) => [...notifications, ...items]);

            // schedule a debounce then flush the array
            api.setState('add_notification_timerId', ({currentValue: timerId, api}) => {
                helpers.timing.clearTimeout(timerId);

                return helpers.timing.setTimeout(() => {
                    const {notifications = []} = api.state;
                    // remove duplicate notifications
                    const uniq = notifications.filter((item, index, array) => array.findIndex(i => i.message === item.message) == index);

                    // let UXF show all notifications at once
                    api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {items: uniq});

                    // reset local notifications array
                    api.setState('notifications', []);
                }, 300);
            });
        }
    }
