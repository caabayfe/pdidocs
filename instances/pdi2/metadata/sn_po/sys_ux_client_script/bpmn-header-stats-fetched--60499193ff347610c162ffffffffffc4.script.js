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
    const {
        formatNumber,
        formatDuration,
    } = imports["global.prominUtils"]();

     const numberUnits = {
        k: await helpers.translate('k'),
        m: await helpers.translate('m'),
        b: await helpers.translate('b')
    };

    const durationUnits = {
        s: await helpers.translate('s'),
        m: await helpers.translate('m'),
        h: await helpers.translate('h'),
        d: await helpers.translate('d')
    };

    // `userPreferences` could be `undefined` in unknown cases
    const userPreferences = api.data.look_up_user_preferences_1.result;
    const country = userPreferences?.country || 'US';
    const language = userPreferences?.language || 'en';

    if (event.name === "DATA_OP_SUCCEEDED") {
        const result = event.payload.data.output.data.GlidePromin_Query;
        const { scheduleBpmnModel, version } = result;

        const playbookStats = [{
            label: await helpers.translate('Table'),
            value: version.projectDefinition.projectEntities[0].table.label
        }, {
            id: 'Records',
            label: await helpers.translate('PROMIN:Records'),
            value: formatNumber(scheduleBpmnModel.caseFreq, {
                units: numberUnits,
                locale: `${language}-${country}`
            })
        }, {
            label: await helpers.translate('Avg duration'),
            value: formatDuration(scheduleBpmnModel.meanDuration, {
                units: durationUnits
            })
        }, {
            label: await helpers.translate('Std deviation duration'),
            value: formatDuration(scheduleBpmnModel.stdDeviation, {
                units: durationUnits
            })
        }, {
            label: await helpers.translate('Med duration'),
            value: formatDuration(scheduleBpmnModel.medianDuration, {
                units: durationUnits
            })
        }];
        const recordHeaderData = {
            "primary": version.projectDefinition.name,
            "secondary": playbookStats,
            "raw": result
        };
        api.setState('header_data', recordHeaderData);
    }
}
