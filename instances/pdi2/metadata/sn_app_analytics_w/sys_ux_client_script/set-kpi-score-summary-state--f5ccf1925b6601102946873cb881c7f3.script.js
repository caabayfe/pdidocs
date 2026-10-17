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
    const apiResponse = api.data.pa_new_model_kpi_score_summary_1.output;
    if (apiResponse 
    && apiResponse.result 
    && apiResponse.result[0]
    && apiResponse.result[0].response 
    && apiResponse.result[0].response.data ) {
        const kpiScoreSummary = apiResponse.result[0].response;
        const JS_MAX_PRECISION = 20; //max value permitted by toLocaleString precision
        const score = kpiScoreSummary && kpiScoreSummary.data[1][1];
        const precision = api.state.kpiMetaData && api.state.kpiMetaData.precision || 0;
        const unit = api.state.kpiMetaData && api.state.kpiMetaData.unit || {};

        /**
        * Returns a number with a certain precision as string.
        * @param  {number}  [number=0]
        * @param  {boolean} [precision=false]
        * @return {String}
        */
        const getNumberValue = (number = 0, precision = false) => {
            // if the y value is null, return null
            if (number === null)
                return null;
            // if locale is not defined, use the default locale
            const locale = api.context.session.user.language || 'en-US';
            // if no decimal precision, return the number as is, localized
            if (typeof precision !== 'number') {
                const dotPosition = number.toString().indexOf('.');
                // number is an integer
                if (dotPosition === 0)
                    return number.toLocaleString(locale);
                // number of fraction digits
                const numberOfFractionDigits = number.toString().slice(dotPosition).length - 1;
                return Number.parseFloat(number).toLocaleString(locale, {
                    maximumFractionDigits: Math.min(numberOfFractionDigits, JS_MAX_PRECISION),
                    minimumFractionDigits: Math.min(numberOfFractionDigits, JS_MAX_PRECISION)
                });
            }
            // apply the locale and decimal precision
            const localizedValue = Number.parseFloat(number).toLocaleString(locale, {
                maximumFractionDigits: Math.min(precision, JS_MAX_PRECISION),
                minimumFractionDigits: Math.min(precision, JS_MAX_PRECISION),
            }, );
            if (localizedValue === '-0')
                return '0';
            return localizedValue;
        };
        /**
        * Returns a string with a unit value adjusted.
        *
        * @param  unitValue  ${0}
        * @param  formattedScore [40.0000]
        *
        * @return {String}
        */
        const replaceVars = (str, vars) => {
            let result = str.toString();
            if (typeof vars !== 'object')
                return result;
            for (const key in vars) {
                if (Object.prototype.hasOwnProperty.call(vars, key)) {
                    const regex = new RegExp(`\\{${  key  }\\}`, 'g');
                    result = result.replace(regex, vars[key]);
                }
            }
            return result;
        };

        let formattedScore = score && score !== "" && score !== "null" ? getNumberValue(score, precision) : null;
        if (unit.value && formattedScore)
            formattedScore = replaceVars(unit.value, [formattedScore]);

        if (kpiScoreSummary)
            api.setState('kpiScoreSummary', { ...kpiScoreSummary,
                'formattedScore': formattedScore,
                'score': score
            });
    }

}
