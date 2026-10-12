			function openCustomTableInventory() {
				var subscriptionName = g_form.getElement("name").value;
				window.location = "/ua_custom_table_inventory_list.do?sysparm_query=^license.name=" + subscriptionName + "^ORlicense.nameISEMPTY^GROUPBYapp_name";
			}
