/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const {
        value,
        unit
    } = api.item.value.time;

    const unitTranslations = {
        hr: "hour",
        min: "minute",
        sec: "second",
        default: "day"
    };

    const translatedUnit = helpers.translateSync(unitTranslations[unit] || unitTranslations.default);
    const ago = helpers.translateSync("ago");

    return `${value}${translatedUnit} ${ago}`;
}
