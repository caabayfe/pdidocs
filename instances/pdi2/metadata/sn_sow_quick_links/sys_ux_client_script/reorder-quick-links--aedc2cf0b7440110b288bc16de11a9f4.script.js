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
    var links = api.state.quickLinks;

    if (event.elementId == 'arrow_down') {
        var index = event.context.item.index;
        var linkObj = links[index];
        links.splice(index, 1);
        links.splice(index + 1, 0, linkObj);
        var prevItemOrder = links[index].order;
        links[index].order = links[index + 1].order;
        links[index + 1].order = prevItemOrder;

        const queryString = 'order=' + links[index].order;
        api.data.update_quick_link_record.execute({
            'table': 'quick_links',
            'recordId': links[index].sys_id,
            'templateFields': queryString,
            'useSetDisplayValue': false
        });

        const queryString1 = 'order=' + links[index + 1].order;
        api.data.update_quick_link_record.execute({
            'table': 'quick_links',
            'recordId': links[index + 1].sys_id,
            'templateFields': queryString1,
            'useSetDisplayValue': false
        });
    } else if (event.elementId == 'arrow_up') {
        var index = event.context.item.index;
        var linkObj = links[index];
        links.splice(index, 1);
        links.splice(index - 1, 0, linkObj);
        var prevItemOrder = links[index - 1].order;
        links[index - 1].order = links[index].order;
        links[index].order = prevItemOrder;

        const queryString = 'order=' + links[index - 1].order;
        api.data.update_quick_link_record.execute({
            'table': 'quick_links',
            'recordId': links[index - 1].sys_id,
            'templateFields': queryString,
            'useSetDisplayValue': false
        });

        const queryString1 = 'order=' + links[index].order;
        api.data.update_quick_link_record.execute({
            'table': 'quick_links',
            'recordId': links[index].sys_id,
            'templateFields': queryString1,
            'useSetDisplayValue': false
        });
    }

    api.data.get_quick_links.refresh();
}
