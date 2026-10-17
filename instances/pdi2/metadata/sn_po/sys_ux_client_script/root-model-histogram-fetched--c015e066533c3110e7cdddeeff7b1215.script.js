/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const histogramList = api.data.fetch_histogram_for_model.output.data.GlidePromin_Query.histogram;
    if (histogramList.length === 0)
        return;

    const modelHistogram = histogramList.find(item => item.type === "DURATION");
    if (!modelHistogram)
        return;

    const {
        bins
    } = modelHistogram;

    const {
        formatDuration
    } = imports["global.prominUtils"]();

    const durationUnits = {
        s: await helpers.translate('s'),
        m: await helpers.translate('m'),
        h: await helpers.translate('h'),
        d: await helpers.translate('d')
    };
    const chartData = [];
    const chartElements = [];
    const labels = [];
    bins.forEach((bin, index) => {
        let itemLabel = `${formatDuration(bin.leftRangeInclusive * 1000, {count: 2, units: durationUnits})}-${formatDuration(bin.rightRangeExclusive * 1000, {count: 2, units: durationUnits})}`;
        if (labels.includes(itemLabel)) {
            // Because we need the "interval" to be unique, we add some spaces at
            // the end so that Xenolith (the chart library) sees them differently,
            // but doesn't render them
            const uniqueSpace = ' '.repeat(index);
            itemLabel += uniqueSpace;
        }
        labels.push(itemLabel);
        chartData.push({
            "duration": itemLabel,
            "value": bin.value
        });
        chartElements.push({
            "label": itemLabel,
            "defaultColor": "10, 184, 217"
        });
    });

    api.setState('histogramBarChartData', [{
        "data": chartData,
        "metadata": {
            "groupBy": [{
                "series": [{
                    "id": "value",
                    "type": "value",
                    "label": await helpers.translate("Distribution of records by time to completion")
                }],
                "elements": chartElements,
                "id": "duration",
                "fieldType": "string",
                "label": await helpers.translate("Duration")
            }],
            "format": {
                "unitFormat": "{0}",
                "precision": 0,
                "thousandSeparatorEnabled": true,
                "abbreviationEnabled": true,
                "numberInTooltipsEnabled": true
            }
        }
    }]);
}
