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
    var qFilter = api.context.props.queue;
    var eFilter = api.context.props.event;
    var startFilter = api.context.props.start;
    var endFilter = api.context.props.end;

    var filterText = await helpers.translate('All');
    var qFilterText = await helpers.translate('All');
    var queueText = await helpers.translate('Queue');
    var eventText = await helpers.translate('Event');

    var dateFilterText = '';

    if (qFilter != undefined && qFilter != null) {
        filterText = filterText + ' > ' + queueText + '=' + qFilter;
    }
    qFilterText = filterText;

    if (eFilter != undefined && eFilter != null) {
        filterText = filterText + ' > ' + eventText + '=' + eFilter;
    }

    if (startFilter != undefined && startFilter != null) {   
        dateFilterText = dateFilterText + ' > ' + await helpers.translate("Interval start after {0}", startFilter) 
        + ' > ' + await helpers.translate("Interval end before {0}", endFilter);
    }

    if (dateFilterText != '') {
        filterText = filterText + dateFilterText;
        qFilterText = qFilterText + dateFilterText;
    }

    api.setState('state_filter_text', filterText);
    api.setState('state_stats_queue_filter_text', qFilterText);
    api.setState('state_stats_date_filter_text', await helpers.translate('All') + dateFilterText);
}
