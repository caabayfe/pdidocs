/**
 * Data broker to get Get unmapped custom application count
 * @return {number} custom application count
 */
function transform() {
    var count = new GlideAggregate('ua_custom_table_inventory');
    count.addEncodedQuery('app_nameISNOTEMPTY^table_refISNOTEMPTY^subscription_entitlementISEMPTY^table_ref.sys_scope!=global');
    count.addAggregate('COUNT(DISTINCT', 'app_name');
    count.query();

    return count.getRowCount();

}
