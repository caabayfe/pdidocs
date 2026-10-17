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
        table,
        highlightedValueConfigId,
        showEmptyValues,
        lookupSelectedData
    } = api.context.props;
    const fields = api.context.props.fields ? api.context.props.fields.split(',') : [];
    const lookUpRowData = lookupSelectedData?.recordLookup;
    const highlightedValues = highlightedValueConfigId && lookupSelectedData?.highlightedValues?.data?.GlideHighlightedValues_Query?.HighlightedValueStyleItem || [];

    const {
        parseLookupData
    } = imports['sn_record_lookup.lookupDataParser']();

    const EMPTY_FIELD_VALUE = await helpers.translate('No data');
    const labelValueItems = parseLookupData(lookUpRowData, fields, showEmptyValues, EMPTY_FIELD_VALUE, highlightedValues);
    const parsedResult = {
        headingName: lookUpRowData?._row_data?.displayValue,
        sysId: lookUpRowData?._row_data?.uniqueValue,
        items: labelValueItems
    };

    api.setState('parsedResult', parsedResult);
    api.setState('loading', false);
    api.emit('RECORD_LOOKUP#LINK_RECORD_DATA_FETCH_COMPLETED_INTERNAL', {
        status: 'succeeded',
        label: parsedResult.headingName,
        table: table,
        sysId: parsedResult.sysId
    });

}
