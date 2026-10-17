function script({ api, event, helpers, imports }) {
    const { getHexColorFromHilightString, snakeToCamelCase } = imports["sn_cmdb_ws.unifiedMapTimelineUtil"]();
    api.setState('timelineDataLoading', false);
    const { relatedItemsData } = event.payload;
    if (!relatedItemsData || !relatedItemsData.allData)
        return;

    const eventData = {};
    const rangeData = {};
    relatedItemsData.allData.forEach((item) => {
        const timelineData = item.timeline;

        if (timelineData.date_field && timelineData.end_date_field) {
            // event is a range if it includes both dates
            const newIndicator = {
                description: item.number + " " + item.title,
                start: timelineData.date_field,
                end: timelineData.end_date_field
            }
            if (!rangeData[timelineData.timeline_legend_category]) {
                rangeData[timelineData.timeline_legend_category] = {
                    ranges: [],
                    name: timelineData.timeline_legend_category.replace(/\s/g,''),
                    label: timelineData.timeline_legend_category,
                    labelPlural: timelineData.timeline_legend_category,
                    color: getHexColorFromHilightString(
                        timelineData.timelineHighlight?.highlightedStyle?.colorName),
                };
            } 
            rangeData[timelineData.timeline_legend_category].ranges.push(newIndicator);
        } else if (timelineData.date_field) {
            const newIndicator = {
                description: item.number + " " + item.title,
                timestamp: timelineData.date_field,
            }
            if (!eventData[timelineData.timeline_legend_category]) {
                eventData[timelineData.timeline_legend_category] = {
                    events: [],
                    name: timelineData.timeline_legend_category.replace(/\s/g,''),
                    label: timelineData.timeline_legend_category,
                    labelPlural: timelineData.timeline_legend_category,
                    icon: snakeToCamelCase(timelineData.icon)
                };
            } 
            eventData[timelineData.timeline_legend_category].events.push(newIndicator);
        }
    });
    api.setState("timelineEventData", Object.values(eventData));
    api.setState("timelineRangeData", Object.values(rangeData));
}
