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
    api.setState('apiStatus', {});
    const results = api.data.fetch_elements_for_a_dimension_1.output.result;
    const transformedElement = [];
    const JS_MAX_PRECISION = 20; //max value permitted by toLocaleString precision
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

    try {
        if (results && results.length > 0) {
            const apiRes = results[0];
            const groupbyMetadata = apiRes.response.metadata.groupBy;
            let elementsMetadata = [];
            let filterId = '';
            if (groupbyMetadata.length > 0) {
                elementsMetadata = groupbyMetadata[0].elements;
                filterId = groupbyMetadata[0].id;
            }
            const scoreData = apiRes.response.data;
            for (var i = 0; i < elementsMetadata.length; i++) {
                const element = {};
                if (elementsMetadata[i].id === 'empty') {
                    var emptyElementId = 'empty_' + groupbyMetadata[0].label;
                    element.value = emptyElementId;
                    element.sysId = emptyElementId;
                } else {
                    element.value = elementsMetadata[i].id;
                    element.sysId = elementsMetadata[i].id;
                }
                element.name = elementsMetadata[i].label;
                if (scoreData.length > 1) {
                    const indexOfElement = scoreData[0].indexOf(elementsMetadata[i].id);
                    if (indexOfElement > -1) {
                        const scoreString = scoreData[1][indexOfElement];
                        if (scoreString && scoreString !== "" && scoreString !== "null") {
                            element.score = Number(scoreString);
                            element.scoreFormatted = getNumberValue(scoreString, precision);               
                            if (unit.value)
                                element.scoreFormatted = replaceVars(unit.value, [element.scoreFormatted]);
                        } else
                            element.scoreFormatted = 'No score';
                    }
                }
                element.filter = filterId;
                transformedElement.push(element);
            }
        }
    } catch (err) {
        api.setState('apiStatus', {
            "target": "element",
            "type": "interrupted"
        });
    }
    if (transformedElement && transformedElement.length === 0) {
        api.setState('apiStatus', {
            "target": "element",
            "type": "no-data"
        });
    }
    api.setState('elements', transformedElement);
}
