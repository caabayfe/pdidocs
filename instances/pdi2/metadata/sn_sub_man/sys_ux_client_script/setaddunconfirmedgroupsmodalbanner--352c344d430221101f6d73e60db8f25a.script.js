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
    /*
    const purchasedCount = parseInt(api.data.sub_ent_record.result.purchased_count.value);
    const currentAllocatedCount = parseInt(api.data.sub_detail_record.results[0].allocated_count.value);
    const unconfirmedUsersCount = parseInt(api.data.unconfirmed_selected_groups.output.data.GlideAggregate_Query[0].sum);
    const unconfirmedGroupsAllocatedCount = currentAllocatedCount + unconfirmedUsersCount;
    api.setState('unconfirmedGroupsAllocatedCount', unconfirmedGroupsAllocatedCount);
    //In case of over allocation, display warning
    const isCompliant = !(purchasedCount < (currentAllocatedCount + unconfirmedUsersCount));
    api.setState('isSubscriptionCountCompliant', isCompliant);
    */

    /*
    if (purchasedCount < (currentAllocatedCount + unconfirmedUsersCount)) {
        api.setState('isSubscriptionCountCompliant', false);
    } else {
        api.setState('isSubscriptionCountCompliant', true);
    }
    */
}
