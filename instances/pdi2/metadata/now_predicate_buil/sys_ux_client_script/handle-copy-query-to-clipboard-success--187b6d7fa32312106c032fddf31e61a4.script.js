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
    try {
        const queryData =
            event.payload.data.output.data.GlidePredicateBuilder_Query;

        const {
            getEncodedQuery
        } = queryData;

        const encodedQuery = getEncodedQuery.encodedQuery || '';
        const fixedEncodedQuery = getEncodedQuery.fixedEncodedQuery || '';

        let copiedText = encodedQuery;

        if (fixedEncodedQuery) {
            copiedText = `${fixedEncodedQuery}^${copiedText}`
        }

        helpers.writeText(copiedText);

        const translatedHeader = await helpers.translate('Query copied to clipboard');

        api.setState('infoMessages', [{
            status: 'positive',
            header: translatedHeader,
            content: copiedText,
        }]);


    } catch (error) {
        const translatedHeader = await helpers.translate('Error copying query to clipboard');
        const infoMessages = [{
            status: 'critical',
            header: translatedHeader,
            content: error.message,
        }, ];

        api.setState('infoMessages', infoMessages);
    }
}
