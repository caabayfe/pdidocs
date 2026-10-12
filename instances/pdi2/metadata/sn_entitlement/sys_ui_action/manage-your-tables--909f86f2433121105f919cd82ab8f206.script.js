
function openCustomTableInventory() {
    var subscriptionName = g_form.getElement("name").value;
    var url = "/ua_custom_table_inventory_list.do?sysparm_query=^subscription_entitlement.name=" + subscriptionName + "^ORsubscription_entitlement.nameISEMPTY^GROUPBYapp_name";
    if (!window)
        globalThis.window.location.href = url;
    else
        window.location.href = url;
}
