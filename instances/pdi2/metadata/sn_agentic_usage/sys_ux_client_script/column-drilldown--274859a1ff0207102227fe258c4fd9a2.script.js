function handler({ api, event, helpers, imports }) {

    const CHART_METRIC = {
        column_1: 'sn.glide.action_fabric.record_action',
        column_2: 'sn.glide.action_fabric.record_action',
        column_3: 'sn.glide.action_fabric.flow_action',
        column_4: 'sn.glide.action_fabric.flow_action'
    };

    const CHART_GRANULARITY = {
        column_1: 'daily',
        column_2: 'monthly',
        column_3: 'daily',
        column_4: 'monthly'
    };

    function formatTimestampRange(timestampRaw, granularity) {
        const ts = Number(timestampRaw);
        const date = new Date(ts);
        const pad = (n) => String(n).padStart(2, '0');

        if (granularity === 'monthly') {
            // Monthly buckets are UTC-anchored (confirmed: raw timestamp for the
            // "July" bucket is 2026-07-01T00:00:00.000Z) — local getters roll it
            // back into the previous day/month in timezones behind UTC.
            const monthStart = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
            const monthEnd = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));

            return {
                startTime: `${monthStart.getUTCFullYear()}-${pad(monthStart.getUTCMonth() + 1)}-${pad(monthStart.getUTCDate())} 00:00:00`,
                endTime: `${monthEnd.getUTCFullYear()}-${pad(monthEnd.getUTCMonth() + 1)}-${pad(monthEnd.getUTCDate())} 23:59:59`
            };
        }

        const formattedDate = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
        return {
            startTime: `${formattedDate} 00:00:00`,
            endTime: `${formattedDate} 23:59:59`
        };
    }

    const { data } = event.payload;
    const listId = event.elementId;
    const { filterConfigurations = [], flowAccessFilterConfigurations = [] } = api.state;

    const tym = data.timestampRaw;
    const granularity = CHART_GRANULARITY[listId] || 'daily';
    const { startTime, endTime } = formatTimestampRange(tym, granularity);
    const metricName = CHART_METRIC[listId] || 'sn.glide.action_fabric.record_action';
    const isFlow = metricName === 'sn.glide.action_fabric.flow_action';

    // ---- Flow charts carry their own filter state (flowAccessFilterConfigurations),
    // separate from Record Access's filterConfigurations — send whichever one
    // actually matches the chart that was clicked.
    const activeFilterConfigurations = isFlow ? flowAccessFilterConfigurations : filterConfigurations;

    api.emit('NAV_ITEM_SELECTED', {
        route: 'action-fabric-list-page',
        fields: {
            listId,
            title: event.payload.title
        },
        params: {
            filters: `element=ele`,
            start: startTime,
            endtime: endTime,
            filterConfigurations: activeFilterConfigurations,
            metricName: metricName
        }
    });
}
