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
    if (event.name === 'DATA_FETCH_FAILED') {
        api.emit('RECORD_LOOKUP#LINK_RECORD_DATA_FETCH_COMPLETED_INTERNAL', {
            status: 'error'
        });
        api.setState('parsedResult', {});
        return;
    }
    const {
        sysId,
        table,
        highlightedValueConfigId
    } = api.context.props;
    const fields = api.context.props.fields ? api.context.props.fields.split(',') : [];
    const lookUpRowData = api.data?.lookup_selected_record_fields?.recordLookup;
    const highlightedValues = highlightedValueConfigId && api.data?.lookup_selected_record_fields?.highlightedValues?.data?.GlideHighlightedValues_Query?.HighlightedValueStyleItem || [];

    if (sysId === null || sysId === '' || sysId === '-1'
        || !lookUpRowData || lookUpRowData.length === 0) {
        api.setState('parsedResult', {});
        return;
    }

    const {
        parseLookupData
    } = imports['sn_record_lookup.lookupDataParser']();
    const {
        showEmptyValues
    } = api.context.props;
    const EMPTY_FIELD_VALUE = await helpers.translate('No data');
    const labelValueItems = parseLookupData(lookUpRowData, fields, showEmptyValues, EMPTY_FIELD_VALUE, highlightedValues);
    const parsedResult = {
        headingName: lookUpRowData?._row_data?.displayValue,
        sysId: lookUpRowData?._row_data?.uniqueValue,
        items: labelValueItems
    };

    api.setState('parsedResult', parsedResult);
    api.setState('loading', false); // 'loading' is setting to true when Look up record data resource initialized
    api.emit('RECORD_LOOKUP#LINK_RECORD_DATA_FETCH_COMPLETED_INTERNAL', {
        status: 'succeeded',
        label: parsedResult.headingName,
        table: table,
        sysId: sysId
    });
}
