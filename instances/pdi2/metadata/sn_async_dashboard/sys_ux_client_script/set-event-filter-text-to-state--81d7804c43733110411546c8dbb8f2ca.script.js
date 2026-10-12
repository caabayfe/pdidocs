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
    var queueText = await helpers.translate('Queue');
    var eventText = await helpers.translate('Event');

    if (qFilter != undefined && qFilter != null) {
        if (qFilter === 'DEFAULT')
            qFilter = 'NULL';
        filterText = filterText + ' > ' + queueText + '=' + qFilter;
    }

    if (eFilter != undefined && eFilter != null) {
        filterText = filterText + ' > ' + eventText + '=' + eFilter;
    }

    if (startFilter != undefined && startFilter != null) {
        if (filterText != '') {
            filterText = filterText + ' > ';
        }
        filterText = filterText + await helpers.translate("Process on between {0} and {1}", startFilter, endFilter);
    }

    api.setState('state_event_filter_text', filterText);
}
