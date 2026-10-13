var emSuggestedGr = new GlideRecord('em_suggested_relation_type');
emSuggestedGr.setLimit(1);
emSuggestedGr.query();
var isTableEmpty = emSuggestedGr.getRowCount() === 0;

// Copy records only if 'em_suggested_relation_type' table is empty
if (isTableEmpty) {
    var evtMgmtCommons = new EvtMgmtCommons();
    var groupingUtil = new EvtMgmtGroupingUtil();
    copySuggestedRelations();
} else {
	gs.info("EM - Copy suggested relationships: Skipping import to em_suggested_relation_type - table already has records.");
}

function copySuggestedRelations() {
    var isNewInstance = evtMgmtCommons.isNewInstance();
    gs.info("Import to cmdb_rel_type_suggest: Is new instance = " + isNewInstance);
    var totalCount = 0;
    // 1. copy over all custom records (not created by admin or system)
    if (!isNewInstance) {
        gs.info("Import to em_suggested_relation_type: Start copying from cmdb_rel_type_suggest to em_suggested_relation_type");
        var oldGr = new GlideRecord('cmdb_rel_type_suggest');
        oldGr.addQuery('sys_updated_by', '!=', 'admin');
        oldGr.addQuery('sys_updated_by', '!=', 'system');
        oldGr.query();
        var count = 0;
        while (oldGr.next()) {
            if (insertEmRecord(oldGr)) {
                ++count;
            }
        }
        gs.info("Import to em_suggested_relation_type: Copied " + count + " custom relationships");
        totalCount += count;
    }

    // 2. copy over the records that came OOB with Paris and before
    // For new instances we don't have to worry about modifications; old instances we need to check if the user modified the OOB relations.
    var oobRecords = isNewInstance ? getOobRecords() : getFilteredOobRecords();
    gs.info("Import to em_suggested_relation_type: Found " + oobRecords.length + " oob records to import");
    oobRecords.forEach(function(rec) {
        if (insertEmRecord(rec)) {
            ++totalCount;
        }
    });

    gs.info("Import to em_suggested_relation_type: Total records inserted = " + totalCount);

    // 3. set the "use cmdb" flag if this is a new instance
    var useAllRelationTypes = isNewInstance;
    var prop = new GlideRecord('sys_properties');
    prop.addQuery("name", "=", "evt_mgmt.related_cis_get_all_relation_types");
    prop.query();
    if (prop.next()) {
        prop.value = useAllRelationTypes;
        prop.update();
        gs.info("Import to em_suggested_relation_type: Updated evt_mgmt.related_cis_get_all_relation_types to " + useAllRelationTypes);
    }
}


function insertEmRecord(copyFrom) {
    if (emRecordExists(copyFrom)) {
        gs.info("Import to em_suggested_relation_type: " + copyFrom.base_class + "/" + copyFrom.dependent_class + " - em_suggested_relation_type record already exists; no need to re-insert");
        return false;
    }
    gs.info("Import to em_suggested_relation_type: Inserting to em_suggested_relation_type: " + copyFrom.base_class + "/" + copyFrom.dependent_class);
    var gr = new GlideRecord('em_suggested_relation_type');
    gr.relationship = copyFrom.relationship;
    gr.base_class = copyFrom.base_class;
    gr.dependent_class = copyFrom.dependent_class;
    groupingUtil.setSuggestedRelationTypeFields(gr);
    gr.insert();
    return true;
}

function emRecordExists(rec) {
    return recordExists('em_suggested_relation_type', rec);
}

function cmdbRecordExists(rec) {
    return recordExists('cmdb_rel_type_suggest', rec);
}

function recordExists(tableName, rec) {
    var gr = new GlideRecord(tableName);
    gr.addQuery("relationship", rec.relationship);
    gr.addQuery("base_class", rec.base_class);
    gr.addQuery("dependent_class", rec.dependent_class);
    gr.setLimit(1);
    gr.query();
    return gr.next();
}

function getFilteredOobRecords() {
    // we need to ensure that the records weren't deleted or modified by the users
    var oob = getOobRecords();
    var result = [];
    oob.forEach(function(rec) {
        if (cmdbRecordExists(rec)) {
            result.push(rec);
        }
    });
    return result;
}

function getOobRecords() {
    return [{
            "relationship": "parent:e8254c8e0a0a0aa7008e7b4550e49047",
            "base_class": "cmdb_ci_computer_room",
            "dependent_class": "cmdb_ci_zone"
        },
        {
            "relationship": "parent:55c913d3c0a8010e012d1563182d6050",
            "base_class": "cmdb_ci_cluster",
            "dependent_class": "cmdb_ci_computer"
        },
        {
            "relationship": "parent:01567b060a0a0bc700870af37e0dbe43",
            "base_class": "cmdb_ci_ups",
            "dependent_class": "cmdb_ci_circuit"
        },
        {
            "relationship": "child:01567b060a0a0bc700870af37e0dbe43",
            "base_class": "cmdb_ci_circuit",
            "dependent_class": "cmdb_ci_ups"
        },
        {
            "relationship": "parent:55ba4972c0a8010e01c5feb5ca39c04c",
            "base_class": "cmdb_ci_circuit",
            "dependent_class": "cmdb_ci_rack"
        },
        {
            "relationship": "child:55ba4972c0a8010e01c5feb5ca39c04c",
            "base_class": "cmdb_ci_rack",
            "dependent_class": "cmdb_ci_circuit"
        },
        {
            "relationship": "parent:55ba4972c0a8010e01c5feb5ca39c04c",
            "base_class": "cmdb_ci_circuit",
            "dependent_class": "cmdb_ci_server"
        },
        {
            "relationship": "child:55ba4972c0a8010e01c5feb5ca39c04c",
            "base_class": "cmdb_ci_server",
            "dependent_class": "cmdb_ci_circuit"
        },
        {
            "relationship": "parent:015633570a0a0bc70029121512d46ede",
            "base_class": "cmdb_ci_crac",
            "dependent_class": "cmdb_ci_computer_room"
        },
        {
            "relationship": "child:015633570a0a0bc70029121512d46ede",
            "base_class": "cmdb_ci_computer_room",
            "dependent_class": "cmdb_ci_crac"
        },
        {
            "relationship": "child:0898719c37020100dcd48c00dfbe5d43",
            "base_class": "cmdb_ci_lb_service",
            "dependent_class": "cmdb_ci_app_server_tomcat"
        },
        {
            "relationship": "child:1bb40e370a0a0b323d85a1ce84f8feae",
            "base_class": "cmdb_ci_solaris_instance",
            "dependent_class": "cmdb_ci_solaris_server"
        },
        {
            "relationship": "child:d93304fb0a0a0b78006081a72ef08444",
            "base_class": "cmdb_ci_vm_instance",
            "dependent_class": "cmdb_ci_win_server"
        },
        {
            "relationship": "child:55c913d3c0a8010e012d1563182d6050",
            "base_class": "cmdb_ci_win_cluster_node",
            "dependent_class": "cmdb_ci_win_cluster"
        },
        {
            "relationship": "child:3deab95338a02000c18673032c71b876",
            "base_class": "cmdb_ci_vcenter_network",
            "dependent_class": "cmdb_ci_vmware_template"
        },
        {
            "relationship": "child:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_app_server_weblogic",
            "dependent_class": "cmdb_ci_app_server_weblogic"
        },
        {
            "relationship": "child:d93304fb0a0a0b78006081a72ef08444",
            "base_class": "cmdb_ci_vm_instance",
            "dependent_class": "cmdb_ci_linux_server"
        },
        {
            "relationship": "child:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_db_mssql_instance",
            "dependent_class": "cmdb_ci_app_server_tomcat"
        },
        {
            "relationship": "parent:cb5592603751200032ff8c00dfbe5d17",
            "base_class": "cmdb_ci_dns_name",
            "dependent_class": "cmdb_ci_ip_address"
        },
        {
            "relationship": "child:25242fb2377a9200738d021a54990e88",
            "base_class": "cmdb_ci_ip_address",
            "dependent_class": "cmdb_ci_network_adapter"
        },
        {
            "relationship": "child:60bc4e22c0a8010e01f074cbe6bd73c3",
            "base_class": "dscy_switchport",
            "dependent_class": "dscy_swtch_partition"
        },
        {
            "relationship": "parent:cb5592603751200032ff8c00dfbe5d17",
            "base_class": "cmdb_ci_lb_service",
            "dependent_class": "cmdb_ci_lb_pool"
        },
        {
            "relationship": "parent:55c913d3c0a8010e012d1563182d6050",
            "base_class": "cmdb_ci_vcenter_cluster",
            "dependent_class": "cmdb_ci_esx_server"
        },
        {
            "relationship": "parent:4afd799338a02000c18673032c71b817",
            "base_class": "cmdb_ci_vcenter_datastore",
            "dependent_class": "cmdb_ci_vcenter_datastore_disk"
        },
        {
            "relationship": "child:281d7566f1571100a92eb60da2bce50d",
            "base_class": "cmdb_ci_ip_switch",
            "dependent_class": "cmdb_ci_lb_bigip"
        },
        {
            "relationship": "parent:60bc4e22c0a8010e01f074cbe6bd73c3",
            "base_class": "cmdb_ci_appl",
            "dependent_class": "cmdb_ci_unix_server"
        },
        {
            "relationship": "parent:25242fb2377a9200738d021a54990e88",
            "base_class": "cmdb_ci_ip_address",
            "dependent_class": "cmdb_ci_datapower_server"
        },
        {
            "relationship": "parent:0898719c37020100dcd48c00dfbe5d43",
            "base_class": "cmdb_ci_app_server_tomcat",
            "dependent_class": "cmdb_ci_lb_service"
        },
        {
            "relationship": "parent:55c95bf6c0a8010e0118ec7056ebc54d",
            "base_class": "cmdb_ci_vcenter_datacenter",
            "dependent_class": "cmdb_ci_vcenter_network"
        },
        {
            "relationship": "parent:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_service",
            "dependent_class": "cmdb_ci_linux_server"
        },
        {
            "relationship": "child:55c95bf6c0a8010e0118ec7056ebc54d",
            "base_class": "cmdb_ci_web_application",
            "dependent_class": "cmdb_ci_app_server_websphere"
        },
        {
            "relationship": "child:55c95bf6c0a8010e0118ec7056ebc54d",
            "base_class": "cmdb_ci_vmware_template",
            "dependent_class": "cmdb_ci_vcenter_folder"
        },
        {
            "relationship": "child:f67e9ecdff602000dada361332f49d35",
            "base_class": "cmdb_ci_iscsi_disk",
            "dependent_class": "cmdb_ci_nas_file_system"
        },
        {
            "relationship": "child:3deab95338a02000c18673032c71b876",
            "base_class": "cmdb_ci_hyper_v_network",
            "dependent_class": "cmdb_ci_hyper_v_instance"
        },
        {
            "relationship": "parent:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_db_ora_listener",
            "dependent_class": "cmdb_ci_db_ora_instance"
        },
        {
            "relationship": "parent:55c95bf6c0a8010e0118ec7056ebc54d",
            "base_class": "cmdb_ci_resource_group",
            "dependent_class": "cmdb_ci_nic"
        },
        {
            "relationship": "parent:281d7566f1571100a92eb60da2bce50d",
            "base_class": "cmdb_ci_linux_server",
            "dependent_class": "cmdb_ci_ip_switch"
        },
        {
            "relationship": "parent:6afd799338a02000c18673032c71b87b",
            "base_class": "cmdb_ci_lb_service",
            "dependent_class": "cmdb_ci_lb_pool"
        },
        {
            "relationship": "parent:55c95bf6c0a8010e0118ec7056ebc54d",
            "base_class": "cmdb_ci_vcenter_datacenter",
            "dependent_class": "cmdb_ci_vcenter_folder"
        },
        {
            "relationship": "child:d93304fb0a0a0b78006081a72ef08444",
            "base_class": "cmdb_ci_computer",
            "dependent_class": "cmdb_ci_esx_server"
        },
        {
            "relationship": "child:f67e9ecdff602000dada361332f49d35",
            "base_class": "cmdb_ci_lb_nginx",
            "dependent_class": "cmdb_ci_nginx_web_server"
        },
        {
            "relationship": "parent:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_service",
            "dependent_class": "cmdb_ci_win_server"
        },
        {
            "relationship": "parent:a99d39118f10310091769012cbbe4429",
            "base_class": "cmdb_ci_win_cluster_node",
            "dependent_class": "cmdb_ci_win_cluster"
        },
        {
            "relationship": "parent:55c95bf6c0a8010e0118ec7056ebc54d",
            "base_class": "cmdb_ci_resource_group",
            "dependent_class": "cmdb_ci_compute_security_group"
        },
        {
            "relationship": "parent:d93304fb0a0a0b78006081a72ef08444",
            "base_class": "cmdb_ci_linux_server",
            "dependent_class": "cmdb_ci_vm_instance"
        },
        {
            "relationship": "parent:c6fd799338a02000c18673032c71b81d",
            "base_class": "cmdb_ci_vcenter_datastore",
            "dependent_class": "cmdb_ci_vmware_instance"
        },
        {
            "relationship": "parent:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_app_server_tomcat",
            "dependent_class": "cmdb_ci_db_mssql_instance"
        },
        {
            "relationship": "parent:cb5592603751200032ff8c00dfbe5d17",
            "base_class": "cmdb_ci_lb_vlan",
            "dependent_class": "cmdb_ci_lb_interface"
        },
        {
            "relationship": "child:60bc4e22c0a8010e01f074cbe6bd73c3",
            "base_class": "cmdb_ci_hyper_v_server",
            "dependent_class": "cmdb_ci_spkg"
        },
        {
            "relationship": "child:55c95bf6c0a8010e0118ec7056ebc54d",
            "base_class": "cmdb_ci_cloud_storage_account",
            "dependent_class": "cmdb_ci_resource_group"
        },
        {
            "relationship": "child:281d7566f1571100a92eb60da2bce50d",
            "base_class": "cmdb_ci_ip_switch",
            "dependent_class": "cmdb_ci_win_server"
        },
        {
            "relationship": "child:f67e9ecdff602000dada361332f49d35",
            "base_class": "cmdb_ci_storage_device",
            "dependent_class": "cmdb_ci_file_system"
        },
        {
            "relationship": "parent:281d7566f1571100a92eb60da2bce50d",
            "base_class": "cmdb_ci_lb_bigip",
            "dependent_class": "cmdb_ci_ip_switch"
        },
        {
            "relationship": "parent:25242fb2377a9200738d021a54990e88",
            "base_class": "dscy_router_interface",
            "dependent_class": "dscy_route_interface"
        },
        {
            "relationship": "parent:25242fb2377a9200738d021a54990e88",
            "base_class": "cmdb_ci_network_adapter",
            "dependent_class": "cmdb_ci_ip_address"
        },
        {
            "relationship": "parent:3deab95338a02000c18673032c71b876",
            "base_class": "cmdb_ci_vmware_instance",
            "dependent_class": "cmdb_ci_vcenter_network"
        },
        {
            "relationship": "parent:55c95bf6c0a8010e0118ec7056ebc54d",
            "base_class": "cmdb_ci_ucs_chassis",
            "dependent_class": "cmdb_ci_ucs_blade"
        },
        {
            "relationship": "parent:55c95bf6c0a8010e0118ec7056ebc54d",
            "base_class": "cmdb_ci_vcenter_datacenter",
            "dependent_class": "cmdb_ci_vcenter_datastore"
        },
        {
            "relationship": "child:cb5592603751200032ff8c00dfbe5d17",
            "base_class": "cmdb_ci_lb_vlan",
            "dependent_class": "cmdb_ci_lb_service"
        },
        {
            "relationship": "child:aa9434870ab301544ce2943bf03fd7a8",
            "base_class": "cmdb_ci_esx_server",
            "dependent_class": "cmdb_ci_vmware_template"
        },
        {
            "relationship": "parent:cb5592603751200032ff8c00dfbe5d17",
            "base_class": "cmdb_ci_win_cluster_node",
            "dependent_class": "cmdb_ci_cluster_vip"
        },
        {
            "relationship": "parent:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_information_object",
            "dependent_class": "cmdb_ci_exchange_mailbox"
        },
        {
            "relationship": "parent:55c913d3c0a8010e012d1563182d6050",
            "base_class": "cmdb_ci_lb_pool",
            "dependent_class": "cmdb_ci_lb_pool_member"
        },
        {
            "relationship": "parent:5f985e0ec0a8010e00a9714f2a172815",
            "base_class": "cmdb_ci_cluster_node",
            "dependent_class": "cmdb_ci_server"
        },
        {
            "relationship": "parent:55c95bf6c0a8010e0118ec7056ebc54d",
            "base_class": "cmdb_ci_vcenter_folder",
            "dependent_class": "cmdb_ci_vmware_instance"
        },
        {
            "relationship": "parent:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_app_server_weblogic",
            "dependent_class": "cmdb_ci_app_server_weblogic"
        },
        {
            "relationship": "child:4afd799338a02000c18673032c71b817",
            "base_class": "cmdb_ci_disk_partition",
            "dependent_class": "cmdb_ci_file_system"
        },
        {
            "relationship": "child:55c95bf6c0a8010e0118ec7056ebc54d",
            "base_class": "cmdb_ci_web_application",
            "dependent_class": "cmdb_ci_app_server_jboss"
        },
        {
            "relationship": "child:281d7566f1571100a92eb60da2bce50d",
            "base_class": "cmdb_ci_ip_switch",
            "dependent_class": "cmdb_ci_lb_a10"
        },
        {
            "relationship": "child:f67e9ecdff602000dada361332f49d35",
            "base_class": "cmdb_ci_file_system",
            "dependent_class": "cmdb_ci_iscsi_disk"
        },
        {
            "relationship": "parent:1bb40e370a0a0b323d85a1ce84f8feae",
            "base_class": "cmdb_ci_vmware_instance",
            "dependent_class": "cmdb_ci_win_server"
        },
        {
            "relationship": "child:1bb40e370a0a0b323d85a1ce84f8feae",
            "base_class": "cmdb_ci_docker_image",
            "dependent_class": "cmdb_ci_docker_local_image"
        },
        {
            "relationship": "child:55c95bf6c0a8010e0118ec7056ebc54d",
            "base_class": "cmdb_ci_nic",
            "dependent_class": "cmdb_ci_cloud_subnet"
        },
        {
            "relationship": "child:4afd799338a02000c18673032c71b817",
            "base_class": "cmdb_ci_esx_server",
            "dependent_class": "cmdb_ci_vcenter_network"
        },
        {
            "relationship": "child:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_config_file",
            "dependent_class": "cmdb_ci_information_object"
        },
        {
            "relationship": "parent:5f985e0ec0a8010e00a9714f2a172815",
            "base_class": "cmdb_ci_cluster",
            "dependent_class": "cmdb_ci_lb_bigip"
        },
        {
            "relationship": "parent:cb5592603751200032ff8c00dfbe5d17",
            "base_class": "cmdb_ci_business_app",
            "dependent_class": "cmdb_ci_information_object"
        },
        {
            "relationship": "child:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_db_ora_instance",
            "dependent_class": "cmdb_ci_db_ora_listener"
        },
        {
            "relationship": "parent:d93304fb0a0a0b78006081a72ef08444",
            "base_class": "cmdb_ci_esx_server",
            "dependent_class": "cmdb_ci_win_server"
        },
        {
            "relationship": "child:72e003db0b032200639be0d425673aa1",
            "base_class": "cmdb_ci_os_template",
            "dependent_class": "cmdb_ci_vm_instance"
        },
        {
            "relationship": "child:4afd799338a02000c18673032c71b817",
            "base_class": "cmdb_ci_storage_pool",
            "dependent_class": "cmdb_ci_file_system"
        },
        {
            "relationship": "parent:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_information_object",
            "dependent_class": "cmdb_ci_db_catalog"
        },
        {
            "relationship": "child:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_computer",
            "dependent_class": "cmdb_ci_computer"
        },
        {
            "relationship": "child:25242fb2377a9200738d021a54990e88",
            "base_class": "cmdb_ci_datapower_server",
            "dependent_class": "cmdb_ci_ip_address"
        },
        {
            "relationship": "child:281d7566f1571100a92eb60da2bce50d",
            "base_class": "cmdb_ci_ip_switch",
            "dependent_class": "cmdb_ci_datapower_server"
        },
        {
            "relationship": "child:5f985e0ec0a8010e00a9714f2a172815",
            "base_class": "cmdb_ci_win_server",
            "dependent_class": "cmdb_ci_win_cluster_node"
        },
        {
            "relationship": "child:55c95bf6c0a8010e0118ec7056ebc54d",
            "base_class": "cmdb_ci_network",
            "dependent_class": "cmdb_ci_availability_zone"
        },
        {
            "relationship": "parent:60bc4e22c0a8010e01f074cbe6bd73c3",
            "base_class": "cmdb_ci_spkg",
            "dependent_class": "cmdb_ci_hyper_v_server"
        },
        {
            "relationship": "parent:55c95bf6c0a8010e0118ec7056ebc54d",
            "base_class": "cmdb_ci_resource_group",
            "dependent_class": "cmdb_ci_cloud_public_ipaddress"
        },
        {
            "relationship": "child:55c95bf6c0a8010e0118ec7056ebc54d",
            "base_class": "cmdb_ci_vcenter_datastore",
            "dependent_class": "cmdb_ci_vcenter_datacenter"
        },
        {
            "relationship": "child:55c913d3c0a8010e012d1563182d6050",
            "base_class": "cmdb_ci_lb_pool_member",
            "dependent_class": "cmdb_ci_lb_pool"
        },
        {
            "relationship": "child:0898719c37020100dcd48c00dfbe5d43",
            "base_class": "dscy_switchport",
            "dependent_class": "dscy_swtch_fwd_rule"
        },
        {
            "relationship": "child:6afd799338a02000c18673032c71b87b",
            "base_class": "cmdb_ci_esx_server",
            "dependent_class": "cmdb_ci_vcenter_datastore"
        },
        {
            "relationship": "parent:5f985e0ec0a8010e00a9714f2a172815",
            "base_class": "cmdb_ci_win_cluster",
            "dependent_class": "cmdb_ci_win_server"
        },
        {
            "relationship": "parent:1bb40e370a0a0b323d85a1ce84f8feae",
            "base_class": "cmdb_ci_linux_server",
            "dependent_class": "cmdb_ci_vmware_instance"
        },
        {
            "relationship": "parent:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_db_ora_instance",
            "dependent_class": "cmdb_ci_db_ora_listener"
        },
        {
            "relationship": "child:5f985e0ec0a8010e00a9714f2a172815",
            "base_class": "cmdb_ci_server",
            "dependent_class": "cmdb_ci_cluster_node"
        },
        {
            "relationship": "child:de5aeb6a0ab3015854626f204fb7b1c0",
            "base_class": "cmdb_ci_win_cluster_node",
            "dependent_class": "cmdb_ci_win_cluster_resource"
        },
        {
            "relationship": "parent:f67e9ecdff602000dada361332f49d35",
            "base_class": "cmdb_ci_file_system",
            "dependent_class": "cmdb_ci_disk"
        },
        {
            "relationship": "parent:55c913d3c0a8010e012d1563182d6050",
            "base_class": "cmdb_ci_hyper_v_cluster",
            "dependent_class": "cmdb_ci_hyper_v_server"
        },
        {
            "relationship": "child:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_endpoint",
            "dependent_class": "cmdb_ci_service"
        },
        {
            "relationship": "parent:4afd799338a02000c18673032c71b817",
            "base_class": "cmdb_ci_nas_file_system",
            "dependent_class": "cmdb_ci_disk_partition"
        },
        {
            "relationship": "parent:55c95bf6c0a8010e0118ec7056ebc54d",
            "base_class": "cmdb_ci_ucs_equipment",
            "dependent_class": "cmdb_ci_ucs_rack_unit"
        },
        {
            "relationship": "parent:55c95bf6c0a8010e0118ec7056ebc54d",
            "base_class": "cmdb_ci_vcenter_datacenter",
            "dependent_class": "cmdb_ci_vmware_template"
        },
        {
            "relationship": "parent:de5aeb6a0ab3015854626f204fb7b1c0",
            "base_class": "cmdb_ci_hyper_v_resource_pool",
            "dependent_class": "cmdb_ci_hyper_v_server"
        },
        {
            "relationship": "child:f67e9ecdff602000dada361332f49d35",
            "base_class": "cmdb_ci_disk",
            "dependent_class": "cmdb_ci_file_system"
        },
        {
            "relationship": "child:4afd799338a02000c18673032c71b817",
            "base_class": "cmdb_ci_disk_partition",
            "dependent_class": "cmdb_ci_nas_file_system"
        },
        {
            "relationship": "parent:d93304fb0a0a0b78006081a72ef08444",
            "base_class": "cmdb_ci_solaris_server",
            "dependent_class": "cmdb_ci_vm_zones"
        },
        {
            "relationship": "parent:cb5592603751200032ff8c00dfbe5d17",
            "base_class": "cmdb_ci_lb_service",
            "dependent_class": "cmdb_ci_lb_vlan"
        },
        {
            "relationship": "parent:25242fb2377a9200738d021a54990e88",
            "base_class": "dscy_route_interface",
            "dependent_class": "dscy_route_next_hop"
        },
        {
            "relationship": "parent:55c95bf6c0a8010e0118ec7056ebc54d",
            "base_class": "cmdb_ci_resource_group",
            "dependent_class": "cmdb_ci_cloud_storage_account"
        },
        {
            "relationship": "parent:d93304fb0a0a0b78006081a72ef08444",
            "base_class": "cmdb_ci_linux_server",
            "dependent_class": "cmdb_ci_esx_server"
        },
        {
            "relationship": "parent:aa9434870ab301544ce2943bf03fd7a8",
            "base_class": "cmdb_ci_vmware_template",
            "dependent_class": "cmdb_ci_esx_server"
        },
        {
            "relationship": "parent:d93304fb0a0a0b78006081a72ef08444",
            "base_class": "cmdb_ci_esx_server",
            "dependent_class": "cmdb_ci_computer"
        },
        {
            "relationship": "parent:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_appl",
            "dependent_class": "cmdb_ci_storage_server"
        },
        {
            "relationship": "parent:1bb40e370a0a0b323d85a1ce84f8feae",
            "base_class": "cmdb_ci_docker_local_image",
            "dependent_class": "cmdb_ci_docker_image"
        },
        {
            "relationship": "child:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_db_ora_listener",
            "dependent_class": "cmdb_ci_db_ora_instance"
        },
        {
            "relationship": "child:55c95bf6c0a8010e0118ec7056ebc54d",
            "base_class": "cmdb_ci_vmware_template",
            "dependent_class": "cmdb_ci_vcenter_datacenter"
        },
        {
            "relationship": "child:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_app_server_tomcat",
            "dependent_class": "cmdb_ci_apache_web_server"
        },
        {
            "relationship": "parent:4afd799338a02000c18673032c71b817",
            "base_class": "cmdb_ci_file_system",
            "dependent_class": "cmdb_ci_disk_partition"
        },
        {
            "relationship": "parent:55c95bf6c0a8010e0118ec7056ebc54d",
            "base_class": "cmdb_ci_cloud_subnet",
            "dependent_class": "cmdb_ci_nic"
        },
        {
            "relationship": "parent:60bc4e22c0a8010e01f074cbe6bd73c3",
            "base_class": "cmdb_ci_hyper_v_server",
            "dependent_class": "cmdb_ci_win_server"
        },
        {
            "relationship": "parent:bf83653c0ab30150761028c73a4de0f4",
            "base_class": "cmdb_ci_storage_server",
            "dependent_class": "cmdb_ci_storage_cluster"
        },
        {
            "relationship": "parent:55c95bf6c0a8010e0118ec7056ebc54d",
            "base_class": "cmdb_ci_app_server_jboss",
            "dependent_class": "cmdb_ci_web_application"
        },
        {
            "relationship": "parent:1bb40e370a0a0b323d85a1ce84f8feae",
            "base_class": "cmdb_ci_docker_container",
            "dependent_class": "cmdb_ci_docker_local_image"
        },
        {
            "relationship": "parent:aa9434870ab301544ce2943bf03fd7a8",
            "base_class": "cmdb_ci_solaris_instance",
            "dependent_class": "cmdb_ci_vm_zones"
        },
        {
            "relationship": "parent:55c95bf6c0a8010e0118ec7056ebc54d",
            "base_class": "cmdb_ci_resource_group",
            "dependent_class": "cmdb_ci_network"
        },
        {
            "relationship": "child:1bb40e370a0a0b323d85a1ce84f8feae",
            "base_class": "cmdb_ci_win_server",
            "dependent_class": "cmdb_ci_vmware_instance"
        },
        {
            "relationship": "child:25242fb2377a9200738d021a54990e88",
            "base_class": "cmdb_ci_lb_pool",
            "dependent_class": "cmdb_ci_lb_pool_member"
        },
        {
            "relationship": "child:55c95bf6c0a8010e0118ec7056ebc54d",
            "base_class": "cmdb_ci_rack",
            "dependent_class": "cmdb_ci_zone"
        },
        {
            "relationship": "parent:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_information_object",
            "dependent_class": "cmdb_ci_file_system"
        },
        {
            "relationship": "parent:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_computer",
            "dependent_class": "cmdb_ci_computer"
        },
        {
            "relationship": "child:55ba4972c0a8010e01c5feb5ca39c04c",
            "base_class": "cmdb_ci_computer",
            "dependent_class": "cmdb_ci_rack"
        },
        {
            "relationship": "child:5f985e0ec0a8010e00a9714f2a172815",
            "base_class": "cmdb_ci_server",
            "dependent_class": "cmdb_ci_database"
        },
        {
            "relationship": "parent:e8254c8e0a0a0aa7008e7b4550e49047",
            "base_class": "cmdb_ci_datacenter",
            "dependent_class": "cmdb_ci_computer_room"
        },
        {
            "relationship": "child:55c913d3c0a8010e012d1563182d6050",
            "base_class": "cmdb_ci_database",
            "dependent_class": "cmdb_ci_cluster"
        },
        {
            "relationship": "child:55c913d3c0a8010e012d1563182d6050",
            "base_class": "cmdb_ci_computer",
            "dependent_class": "cmdb_ci_cluster"
        },
        {
            "relationship": "parent:e81e87c30a0a0aa7002dd03d09af0f6a",
            "base_class": "cmdb_ci_computer_room",
            "dependent_class": "cmdb_ci_vm_zones"
        },
        {
            "relationship": "child:e81e87c30a0a0aa7002dd03d09af0f6a",
            "base_class": "cmdb_ci_computer_room",
            "dependent_class": "cmdb_ci_datacenter"
        },
        {
            "relationship": "parent:55c95bf6c0a8010e0118ec7056ebc54d",
            "base_class": "cmdb_ci_zone",
            "dependent_class": "cmdb_ci_rack"
        },
        {
            "relationship": "child:e8254c8e0a0a0aa7008e7b4550e49047",
            "base_class": "cmdb_ci_zone",
            "dependent_class": "cmdb_ci_computer_room"
        },
        {
            "relationship": "parent:55ba4972c0a8010e01c5feb5ca39c04c",
            "base_class": "cmdb_ci_rack",
            "dependent_class": "cmdb_ci_computer"
        },
        {
            "relationship": "child:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_server",
            "dependent_class": "cmdb_ci_service"
        },
        {
            "relationship": "child:cb5592603751200032ff8c00dfbe5d17",
            "base_class": "cmdb_ci_information_object",
            "dependent_class": "cmdb_ci_business_app"
        },
        {
            "relationship": "parent:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_service",
            "dependent_class": "cmdb_ci_server"
        },
        {
            "relationship": "child:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_exchange_mailbox",
            "dependent_class": "cmdb_ci_information_object"
        },
        {
            "relationship": "child:281d7566f1571100a92eb60da2bce50d",
            "base_class": "cmdb_ci_ip_switch",
            "dependent_class": "cmdb_ci_lb_alteon"
        },
        {
            "relationship": "parent:25242fb2377a9200738d021a54990e88",
            "base_class": "cmdb_ci_lb_pool_member",
            "dependent_class": "cmdb_ci_lb_pool"
        },
        {
            "relationship": "child:60bc4e22c0a8010e01f074cbe6bd73c3",
            "base_class": "cmdb_ci_app_server_websphere",
            "dependent_class": "cmdb_ci_web_service"
        },
        {
            "relationship": "parent:f67e9ecdff602000dada361332f49d35",
            "base_class": "cmdb_ci_file_system",
            "dependent_class": "cmdb_ci_disk_partition"
        },
        {
            "relationship": "child:55c95bf6c0a8010e0118ec7056ebc54d",
            "base_class": "cmdb_ci_vcenter_network",
            "dependent_class": "cmdb_ci_vcenter_datacenter"
        },
        {
            "relationship": "child:6afd799338a02000c18673032c71b87b",
            "base_class": "cmdb_ci_dns_alias",
            "dependent_class": "cmdb_ci_dns_name"
        },
        {
            "relationship": "child:281d7566f1571100a92eb60da2bce50d",
            "base_class": "cmdb_ci_ip_switch",
            "dependent_class": "cmdb_ci_linux_server"
        },
        {
            "relationship": "child:281d7566f1571100a92eb60da2bce50d",
            "base_class": "cmdb_ci_ip_switch",
            "dependent_class": "cmdb_ci_hpux_server"
        },
        {
            "relationship": "child:55c913d3c0a8010e012d1563182d6050",
            "base_class": "cmdb_ci_esx_server",
            "dependent_class": "cmdb_ci_vcenter_cluster"
        },
        {
            "relationship": "child:41008aa6ef32010098d5925495c0fb94",
            "base_class": "cmdb_ci_service",
            "dependent_class": "cmdb_ci_business_app"
        },
        {
            "relationship": "child:4afd799338a02000c18673032c71b817",
            "base_class": "cmdb_ci_storage_pool",
            "dependent_class": "cmdb_ci_nas_file_system"
        },
        {
            "relationship": "child:55c95bf6c0a8010e0118ec7056ebc54d",
            "base_class": "cmdb_ci_compute_security_group",
            "dependent_class": "cmdb_ci_network"
        },
        {
            "relationship": "child:f67e9ecdff602000dada361332f49d35",
            "base_class": "cmdb_ci_fc_disk",
            "dependent_class": "cmdb_ci_nas_file_system"
        },
        {
            "relationship": "child:55c95bf6c0a8010e0118ec7056ebc54d",
            "base_class": "cmdb_ci_cloud_subnet",
            "dependent_class": "cmdb_ci_availability_zone"
        },
        {
            "relationship": "parent:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_service",
            "dependent_class": "cmdb_ci_service"
        },
        {
            "relationship": "child:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_service",
            "dependent_class": "cmdb_ci_service"
        },
        {
            "relationship": "parent:60bc4e22c0a8010e01f074cbe6bd73c3",
            "base_class": "cmdb_ci_win_server",
            "dependent_class": "cmdb_ci_server"
        },
        {
            "relationship": "child:60bc4e22c0a8010e01f074cbe6bd73c3",
            "base_class": "cmdb_ci_server",
            "dependent_class": "cmdb_ci_win_server"
        },
        {
            "relationship": "parent:607b15e1c0a8010e00a4413059767eec",
            "base_class": "cmdb_ci_server",
            "dependent_class": "cmdb_ci_msd"
        },
        {
            "relationship": "child:607b15e1c0a8010e00a4413059767eec",
            "base_class": "cmdb_ci_msd",
            "dependent_class": "cmdb_ci_server"
        },
        {
            "relationship": "child:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_win_server",
            "dependent_class": "cmdb_ci_service"
        },
        {
            "relationship": "parent:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_service",
            "dependent_class": "cmdb_ci_email_server"
        },
        {
            "relationship": "child:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_email_server",
            "dependent_class": "cmdb_ci_service"
        },
        {
            "relationship": "parent:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_email_server",
            "dependent_class": "cmdb_ci_email_server"
        },
        {
            "relationship": "child:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_email_server",
            "dependent_class": "cmdb_ci_email_server"
        },
        {
            "relationship": "parent:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_email_server",
            "dependent_class": "cmdb_ci_msd"
        },
        {
            "relationship": "child:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_msd",
            "dependent_class": "cmdb_ci_email_server"
        },
        {
            "relationship": "parent:5599a965c0a8010e00da3b58b113d70e",
            "base_class": "cmdb_ci_email_server",
            "dependent_class": "cmdb_ci_msd"
        },
        {
            "relationship": "child:5599a965c0a8010e00da3b58b113d70e",
            "base_class": "cmdb_ci_msd",
            "dependent_class": "cmdb_ci_email_server"
        },
        {
            "relationship": "parent:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_service",
            "dependent_class": "cmdb_ci_appl"
        },
        {
            "relationship": "child:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_appl",
            "dependent_class": "cmdb_ci_service"
        },
        {
            "relationship": "child:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_unix_server",
            "dependent_class": "cmdb_ci_service"
        },
        {
            "relationship": "parent:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_service",
            "dependent_class": "cmdb_ci_computer"
        },
        {
            "relationship": "child:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_computer",
            "dependent_class": "cmdb_ci_service"
        },
        {
            "relationship": "parent:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_computer",
            "dependent_class": "cmdb_ci_peripheral"
        },
        {
            "relationship": "child:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_peripheral",
            "dependent_class": "cmdb_ci_computer"
        },
        {
            "relationship": "parent:60bc4e22c0a8010e01f074cbe6bd73c3",
            "base_class": "cmdb_ci_appl",
            "dependent_class": "cmdb_ci_server"
        },
        {
            "relationship": "child:60bc4e22c0a8010e01f074cbe6bd73c3",
            "base_class": "cmdb_ci_win_server",
            "dependent_class": "cmdb_ci_appl"
        },
        {
            "relationship": "parent:607ad1b2c0a8010e01941856b365af90",
            "base_class": "cmdb_ci_win_server",
            "dependent_class": "cmdb_ci_netgear"
        },
        {
            "relationship": "child:607ad1b2c0a8010e01941856b365af90",
            "base_class": "cmdb_ci_netgear",
            "dependent_class": "cmdb_ci_win_server"
        },
        {
            "relationship": "parent:607b15e1c0a8010e00a4413059767eec",
            "base_class": "cmdb_ci_win_server",
            "dependent_class": "cmdb_ci_msd"
        },
        {
            "relationship": "child:607b15e1c0a8010e00a4413059767eec",
            "base_class": "cmdb_ci_msd",
            "dependent_class": "cmdb_ci_win_server"
        },
        {
            "relationship": "parent:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_service",
            "dependent_class": "cmdb_ci_web_server"
        },
        {
            "relationship": "child:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_web_server",
            "dependent_class": "cmdb_ci_service"
        },
        {
            "relationship": "child:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_linux_server",
            "dependent_class": "cmdb_ci_service"
        },
        {
            "relationship": "parent:5599a965c0a8010e00da3b58b113d70e",
            "base_class": "cmdb_ci_service",
            "dependent_class": "cmdb_ci_netgear"
        },
        {
            "relationship": "child:5599a965c0a8010e00da3b58b113d70e",
            "base_class": "cmdb_ci_netgear",
            "dependent_class": "cmdb_ci_service"
        },
        {
            "relationship": "parent:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_service",
            "dependent_class": "cmdb_ci_database"
        },
        {
            "relationship": "child:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_database",
            "dependent_class": "cmdb_ci_service"
        },
        {
            "relationship": "parent:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_service",
            "dependent_class": "cmdb_ci_netgear"
        },
        {
            "relationship": "child:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_netgear",
            "dependent_class": "cmdb_ci_service"
        },
        {
            "relationship": "parent:5f985e0ec0a8010e00a9714f2a172815",
            "base_class": "cmdb_ci_database",
            "dependent_class": "cmdb_ci_database"
        },
        {
            "relationship": "child:5f985e0ec0a8010e00a9714f2a172815",
            "base_class": "cmdb_ci_database",
            "dependent_class": "cmdb_ci_database"
        },
        {
            "relationship": "parent:55c913d3c0a8010e012d1563182d6050",
            "base_class": "cmdb_ci_cluster",
            "dependent_class": "cmdb_ci_unix_server"
        },
        {
            "relationship": "child:55c913d3c0a8010e012d1563182d6050",
            "base_class": "cmdb_ci_unix_server",
            "dependent_class": "cmdb_ci_cluster"
        },
        {
            "relationship": "parent:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_database",
            "dependent_class": "cmdb_ci_cluster"
        },
        {
            "relationship": "child:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_cluster",
            "dependent_class": "cmdb_ci_database"
        },
        {
            "relationship": "parent:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_unix_server",
            "dependent_class": "cmdb_ci_msd"
        },
        {
            "relationship": "child:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_msd",
            "dependent_class": "cmdb_ci_unix_server"
        },
        {
            "relationship": "parent:60bc4e22c0a8010e01f074cbe6bd73c3",
            "base_class": "cmdb_ci_web_server",
            "dependent_class": "cmdb_ci_linux_server"
        },
        {
            "relationship": "child:60bc4e22c0a8010e01f074cbe6bd73c3",
            "base_class": "cmdb_ci_linux_server",
            "dependent_class": "cmdb_ci_web_server"
        },
        {
            "relationship": "child:60bc4e22c0a8010e01f074cbe6bd73c3",
            "base_class": "cmdb_ci_unix_server",
            "dependent_class": "cmdb_ci_appl"
        },
        {
            "relationship": "parent:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_appl",
            "dependent_class": "cmdb_ci_database"
        },
        {
            "relationship": "child:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_database",
            "dependent_class": "cmdb_ci_appl"
        },
        {
            "relationship": "parent:60bc4e22c0a8010e01f074cbe6bd73c3",
            "base_class": "cmdb_ci_database",
            "dependent_class": "cmdb_ci_unix_server"
        },
        {
            "relationship": "child:60bc4e22c0a8010e01f074cbe6bd73c3",
            "base_class": "cmdb_ci_unix_server",
            "dependent_class": "cmdb_ci_database"
        },
        {
            "relationship": "parent:5599a965c0a8010e00da3b58b113d70e",
            "base_class": "cmdb_ci_unix_server",
            "dependent_class": "cmdb_ci_netgear"
        },
        {
            "relationship": "child:5599a965c0a8010e00da3b58b113d70e",
            "base_class": "cmdb_ci_netgear",
            "dependent_class": "cmdb_ci_unix_server"
        },
        {
            "relationship": "parent:63032f62c0a8010e0081e1f99c876bf7",
            "base_class": "cmdb_ci_service",
            "dependent_class": "cmdb_ci_service"
        },
        {
            "relationship": "child:63032f62c0a8010e0081e1f99c876bf7",
            "base_class": "cmdb_ci_service",
            "dependent_class": "cmdb_ci_service"
        },
        {
            "relationship": "parent:607b15e1c0a8010e00a4413059767eec",
            "base_class": "cmdb_ci_service",
            "dependent_class": "cmdb_ci_appl"
        },
        {
            "relationship": "child:607b15e1c0a8010e00a4413059767eec",
            "base_class": "cmdb_ci_appl",
            "dependent_class": "cmdb_ci_service"
        },
        {
            "relationship": "parent:60bc4e22c0a8010e01f074cbe6bd73c3",
            "base_class": "cmdb_ci_service",
            "dependent_class": "cmdb_ci_unix_server"
        },
        {
            "relationship": "child:60bc4e22c0a8010e01f074cbe6bd73c3",
            "base_class": "cmdb_ci_unix_server",
            "dependent_class": "cmdb_ci_service"
        },
        {
            "relationship": "parent:e7f235380a0a0aa7000e410d8c6a9a54",
            "base_class": "cmdb_ci_zone",
            "dependent_class": "cmdb_ci_rack"
        },
        {
            "relationship": "child:e7f235380a0a0aa7000e410d8c6a9a54",
            "base_class": "cmdb_ci_rack",
            "dependent_class": "cmdb_ci_zone"
        },
        {
            "relationship": "parent:e81e87c30a0a0aa7002dd03d09af0f6a",
            "base_class": "cmdb_ci_computer_room",
            "dependent_class": "cmdb_ci_zone"
        },
        {
            "relationship": "child:e81e87c30a0a0aa7002dd03d09af0f6a",
            "base_class": "cmdb_ci_zone",
            "dependent_class": "cmdb_ci_computer_room"
        },
        {
            "relationship": "child:e8254c8e0a0a0aa7008e7b4550e49047",
            "base_class": "cmdb_ci_computer_room",
            "dependent_class": "cmdb_ci_datacenter"
        },
        {
            "relationship": "parent:281d7566f1571100a92eb60da2bce50d",
            "base_class": "cmdb_ci_lb_a10",
            "dependent_class": "cmdb_ci_ip_switch"
        },
        {
            "relationship": "parent:4afd799338a02000c18673032c71b817",
            "base_class": "cmdb_ci_vcenter_network",
            "dependent_class": "cmdb_ci_esx_server"
        },
        {
            "relationship": "parent:e81e87c30a0a0aa7002dd03d09af0f6a",
            "base_class": "cmdb_ci_datacenter",
            "dependent_class": "cmdb_ci_computer_room"
        },
        {
            "relationship": "child:a99d39118f10310091769012cbbe4429",
            "base_class": "cmdb_ci_win_cluster",
            "dependent_class": "cmdb_ci_win_cluster_node"
        },
        {
            "relationship": "parent:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_service",
            "dependent_class": "cmdb_ci_unix_server"
        },
        {
            "relationship": "child:0898719c37020100dcd48c00dfbe5d43",
            "base_class": "cmdb_ci_lb_service",
            "dependent_class": "cmdb_ci_win_server"
        },
        {
            "relationship": "parent:f67e9ecdff602000dada361332f49d35",
            "base_class": "cmdb_ci_iscsi_disk",
            "dependent_class": "cmdb_ci_file_system"
        },
        {
            "relationship": "parent:55c913d3c0a8010e012d1563182d6050",
            "base_class": "cmdb_ci_cluster",
            "dependent_class": "cmdb_ci_database"
        },
        {
            "relationship": "child:cb5592603751200032ff8c00dfbe5d17",
            "base_class": "cmdb_ci_lb_interface",
            "dependent_class": "cmdb_ci_lb_vlan"
        },
        {
            "relationship": "child:25242fb2377a9200738d021a54990e88",
            "base_class": "dscy_route_interface",
            "dependent_class": "dscy_router_interface"
        },
        {
            "relationship": "child:55c95bf6c0a8010e0118ec7056ebc54d",
            "base_class": "cmdb_ci_compute_security_group",
            "dependent_class": "cmdb_ci_resource_group"
        },
        {
            "relationship": "child:c6fd799338a02000c18673032c71b81d",
            "base_class": "cmdb_ci_vmware_instance",
            "dependent_class": "cmdb_ci_vcenter_datastore"
        },
        {
            "relationship": "child:d93304fb0a0a0b78006081a72ef08444",
            "base_class": "cmdb_ci_win_server",
            "dependent_class": "cmdb_ci_esx_server"
        },
        {
            "relationship": "child:281d7566f1571100a92eb60da2bce50d",
            "base_class": "cmdb_ci_ip_switch",
            "dependent_class": "cmdb_ci_aix_server"
        },
        {
            "relationship": "parent:4afd799338a02000c18673032c71b817",
            "base_class": "cmdb_ci_nas_file_system",
            "dependent_class": "cmdb_ci_storage_pool"
        },
        {
            "relationship": "parent:60bc4e22c0a8010e01f074cbe6bd73c3",
            "base_class": "cmdb_ci_web_service",
            "dependent_class": "cmdb_ci_app_server_websphere"
        },
        {
            "relationship": "parent:72e003db0b032200639be0d425673aa1",
            "base_class": "cmdb_ci_vm_instance",
            "dependent_class": "cmdb_ci_os_template"
        },
        {
            "relationship": "parent:55c95bf6c0a8010e0118ec7056ebc54d",
            "base_class": "cmdb_ci_resource_group",
            "dependent_class": "cmdb_ci_cloud_subnet"
        },
        {
            "relationship": "parent:281d7566f1571100a92eb60da2bce50d",
            "base_class": "cmdb_ci_datapower_server",
            "dependent_class": "cmdb_ci_ip_switch"
        },
        {
            "relationship": "parent:4afd799338a02000c18673032c71b817",
            "base_class": "cmdb_ci_file_system",
            "dependent_class": "cmdb_ci_storage_pool"
        },
        {
            "relationship": "child:55c95bf6c0a8010e0118ec7056ebc54d",
            "base_class": "cmdb_ci_cloud_public_ipaddress",
            "dependent_class": "cmdb_ci_resource_group"
        },
        {
            "relationship": "child:25242fb2377a9200738d021a54990e88",
            "base_class": "dscy_route_next_hop",
            "dependent_class": "dscy_route_interface"
        },
        {
            "relationship": "parent:6afd799338a02000c18673032c71b87b",
            "base_class": "cmdb_ci_dns_name",
            "dependent_class": "cmdb_ci_dns_alias"
        },
        {
            "relationship": "parent:3deab95338a02000c18673032c71b876",
            "base_class": "cmdb_ci_vmware_template",
            "dependent_class": "cmdb_ci_vcenter_network"
        },
        {
            "relationship": "parent:55c95bf6c0a8010e0118ec7056ebc54d",
            "base_class": "cmdb_ci_network",
            "dependent_class": "cmdb_ci_compute_security_group"
        },
        {
            "relationship": "parent:281d7566f1571100a92eb60da2bce50d",
            "base_class": "cmdb_ci_hpux_server",
            "dependent_class": "cmdb_ci_ip_switch"
        },
        {
            "relationship": "child:d93304fb0a0a0b78006081a72ef08444",
            "base_class": "cmdb_ci_vm_zones",
            "dependent_class": "cmdb_ci_solaris_server"
        },
        {
            "relationship": "child:d93304fb0a0a0b78006081a72ef08444",
            "base_class": "cmdb_ci_esx_server",
            "dependent_class": "cmdb_ci_linux_server"
        },
        {
            "relationship": "child:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_storage_server",
            "dependent_class": "cmdb_ci_appl"
        },
        {
            "relationship": "child:85d98503ff100200d699ffffffffff8c",
            "base_class": "cmdb_ci_win_cluster_node",
            "dependent_class": "cmdb_ci_cluster_vip"
        },
        {
            "relationship": "child:55c95bf6c0a8010e0118ec7056ebc54d",
            "base_class": "cmdb_ci_websphere_cell",
            "dependent_class": "cmdb_ci_app_server_websphere"
        },
        {
            "relationship": "parent:1bb40e370a0a0b323d85a1ce84f8feae",
            "base_class": "cmdb_ci_solaris_server",
            "dependent_class": "cmdb_ci_solaris_instance"
        },
        {
            "relationship": "parent:d93304fb0a0a0b78006081a72ef08444",
            "base_class": "cmdb_ci_win_server",
            "dependent_class": "cmdb_ci_vm_instance"
        },
        {
            "relationship": "parent:f67e9ecdff602000dada361332f49d35",
            "base_class": "cmdb_ci_nas_file_system",
            "dependent_class": "cmdb_ci_fc_disk"
        },
        {
            "relationship": "parent:55c95bf6c0a8010e0118ec7056ebc54d",
            "base_class": "cmdb_ci_availability_zone",
            "dependent_class": "cmdb_ci_cloud_subnet"
        },
        {
            "relationship": "child:5f985e0ec0a8010e00a9714f2a172815",
            "base_class": "cmdb_ci_win_server",
            "dependent_class": "cmdb_ci_win_cluster"
        },
        {
            "relationship": "child:281d7566f1571100a92eb60da2bce50d",
            "base_class": "cmdb_ci_ip_switch",
            "dependent_class": "cmdb_ci_lb_netscaler"
        },
        {
            "relationship": "parent:60bc4e22c0a8010e01f074cbe6bd73c3",
            "base_class": "dscy_swtch_partition",
            "dependent_class": "dscy_switchport"
        },
        {
            "relationship": "parent:0898719c37020100dcd48c00dfbe5d43",
            "base_class": "cmdb_ci_win_server",
            "dependent_class": "cmdb_ci_lb_service"
        },
        {
            "relationship": "parent:55c95bf6c0a8010e0118ec7056ebc54d",
            "base_class": "cmdb_ci_app_server_websphere",
            "dependent_class": "cmdb_ci_web_application"
        },
        {
            "relationship": "parent:281d7566f1571100a92eb60da2bce50d",
            "base_class": "cmdb_ci_solaris_server",
            "dependent_class": "cmdb_ci_ip_switch"
        },
        {
            "relationship": "parent:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_service",
            "dependent_class": "cmdb_ci_endpoint"
        },
        {
            "relationship": "child:cb5592603751200032ff8c00dfbe5d17",
            "base_class": "cmdb_ci_cluster_vip",
            "dependent_class": "cmdb_ci_win_cluster_node"
        },
        {
            "relationship": "child:1bb40e370a0a0b323d85a1ce84f8feae",
            "base_class": "cmdb_ci_docker_local_image",
            "dependent_class": "cmdb_ci_docker_container"
        },
        {
            "relationship": "child:55c95bf6c0a8010e0118ec7056ebc54d",
            "base_class": "cmdb_ci_network",
            "dependent_class": "cmdb_ci_resource_group"
        },
        {
            "relationship": "child:60bc4e22c0a8010e01f074cbe6bd73c3",
            "base_class": "cmdb_ci_win_server",
            "dependent_class": "cmdb_ci_hyper_v_server"
        },
        {
            "relationship": "child:aa9434870ab301544ce2943bf03fd7a8",
            "base_class": "cmdb_ci_vm_zones",
            "dependent_class": "cmdb_ci_solaris_instance"
        },
        {
            "relationship": "child:bf83653c0ab30150761028c73a4de0f4",
            "base_class": "cmdb_ci_storage_cluster",
            "dependent_class": "cmdb_ci_storage_server"
        },
        {
            "relationship": "child:5f985e0ec0a8010e00a9714f2a172815",
            "base_class": "cmdb_ci_lb_bigip",
            "dependent_class": "cmdb_ci_cluster"
        },
        {
            "relationship": "child:4afd799338a02000c18673032c71b817",
            "base_class": "cmdb_ci_vcenter_datastore_disk",
            "dependent_class": "cmdb_ci_vcenter_datastore"
        },
        {
            "relationship": "child:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_file_system",
            "dependent_class": "cmdb_ci_information_object"
        },
        {
            "relationship": "child:cb5592603751200032ff8c00dfbe5d17",
            "base_class": "cmdb_ci_lb_pool",
            "dependent_class": "cmdb_ci_lb_service"
        },
        {
            "relationship": "child:55c95bf6c0a8010e0118ec7056ebc54d",
            "base_class": "cmdb_ci_nic",
            "dependent_class": "cmdb_ci_resource_group"
        },
        {
            "relationship": "child:55c95bf6c0a8010e0118ec7056ebc54d",
            "base_class": "cmdb_ci_cloud_subnet",
            "dependent_class": "cmdb_ci_resource_group"
        },
        {
            "relationship": "child:cb5592603751200032ff8c00dfbe5d17",
            "base_class": "cmdb_ci_ip_address",
            "dependent_class": "cmdb_ci_dns_name"
        },
        {
            "relationship": "child:55c95bf6c0a8010e0118ec7056ebc54d",
            "base_class": "cmdb_ci_ucs_blade",
            "dependent_class": "cmdb_ci_ucs_chassis"
        },
        {
            "relationship": "child:55c95bf6c0a8010e0118ec7056ebc54d",
            "base_class": "cmdb_ci_vmware_instance",
            "dependent_class": "cmdb_ci_vcenter_folder"
        },
        {
            "relationship": "child:6afd799338a02000c18673032c71b87b",
            "base_class": "cmdb_ci_lb_pool",
            "dependent_class": "cmdb_ci_lb_service"
        },
        {
            "relationship": "child:f67e9ecdff602000dada361332f49d35",
            "base_class": "cmdb_ci_file_system",
            "dependent_class": "cmdb_ci_disk"
        },
        {
            "relationship": "child:55c913d3c0a8010e012d1563182d6050",
            "base_class": "cmdb_ci_vmware_instance",
            "dependent_class": "cmdb_ci_esx_resource_pool"
        },
        {
            "relationship": "parent:72e003db0b032200639be0d425673aa1",
            "base_class": "cmdb_ci_vm_instance",
            "dependent_class": "cmdb_ci_compute_template"
        },
        {
            "relationship": "parent:5f985e0ec0a8010e00a9714f2a172815",
            "base_class": "cmdb_ci_win_cluster_node",
            "dependent_class": "cmdb_ci_win_server"
        },
        {
            "relationship": "parent:5f985e0ec0a8010e00a9714f2a172815",
            "base_class": "cmdb_ci_database",
            "dependent_class": "cmdb_ci_server"
        },
        {
            "relationship": "child:3deab95338a02000c18673032c71b876",
            "base_class": "cmdb_ci_vcenter_network",
            "dependent_class": "cmdb_ci_vmware_instance"
        },
        {
            "relationship": "child:55c95bf6c0a8010e0118ec7056ebc54d",
            "base_class": "cmdb_ci_vcenter_folder",
            "dependent_class": "cmdb_ci_vcenter_datacenter"
        },
        {
            "relationship": "child:f67e9ecdff602000dada361332f49d35",
            "base_class": "cmdb_ci_disk_partition",
            "dependent_class": "cmdb_ci_file_system"
        },
        {
            "relationship": "child:55c95bf6c0a8010e0118ec7056ebc54d",
            "base_class": "cmdb_ci_ucs_chassis",
            "dependent_class": "cmdb_ci_ucs_equipment"
        },
        {
            "relationship": "child:a99d39118f10310091769012cbbe4429",
            "base_class": "cmdb_ci_application_cluster",
            "dependent_class": "cmdb_ci_endpoint"
        },
        {
            "relationship": "parent:de5aeb6a0ab3015854626f204fb7b1c0",
            "base_class": "cmdb_ci_win_cluster_resource",
            "dependent_class": "cmdb_ci_win_cluster_node"
        },
        {
            "relationship": "parent:de5aeb6a0ab3015854626f204fb7b1c0",
            "base_class": "cmdb_ci_esx_resource_pool",
            "dependent_class": "cmdb_ci_vcenter_cluster"
        },
        {
            "relationship": "child:aa9434870ab301544ce2943bf03fd7a8",
            "base_class": "cmdb_ci_esx_server",
            "dependent_class": "cmdb_ci_vm_instance"
        },
        {
            "relationship": "parent:aa9434870ab301544ce2943bf03fd7a8",
            "base_class": "cmdb_ci_vm_instance",
            "dependent_class": "cmdb_ci_esx_server"
        },
        {
            "relationship": "child:bf83653c0ab30150761028c73a4de0f4",
            "base_class": "cmdb_ci_vcenter",
            "dependent_class": "cmdb_ci_esx_server"
        },
        {
            "relationship": "parent:bf83653c0ab30150761028c73a4de0f4",
            "base_class": "cmdb_ci_esx_server",
            "dependent_class": "cmdb_ci_vcenter"
        },
        {
            "relationship": "child:281d7566f1571100a92eb60da2bce50d",
            "base_class": "cmdb_ci_ip_switch",
            "dependent_class": "cmdb_ci_solaris_server"
        },
        {
            "relationship": "child:72e003db0b032200639be0d425673aa1",
            "base_class": "cmdb_ci_compute_template",
            "dependent_class": "cmdb_ci_vm_instance"
        },
        {
            "relationship": "parent:0898719c37020100dcd48c00dfbe5d43",
            "base_class": "dscy_swtch_fwd_rule",
            "dependent_class": "dscy_switchport"
        },
        {
            "relationship": "parent:55c95bf6c0a8010e0118ec7056ebc54d",
            "base_class": "cmdb_ci_ucs_equipment",
            "dependent_class": "cmdb_ci_ucs_chassis"
        },
        {
            "relationship": "child:de5aeb6a0ab3015854626f204fb7b1c0",
            "base_class": "cmdb_ci_vcenter_cluster",
            "dependent_class": "cmdb_ci_esx_resource_pool"
        },
        {
            "relationship": "parent:de5aeb6a0ab3015854626f204fb7b1c0",
            "base_class": "cmdb_ci_esx_resource_pool",
            "dependent_class": "cmdb_ci_esx_server"
        },
        {
            "relationship": "child:de5aeb6a0ab3015854626f204fb7b1c0",
            "base_class": "cmdb_ci_esx_server",
            "dependent_class": "cmdb_ci_esx_resource_pool"
        },
        {
            "relationship": "parent:55c95bf6c0a8010e0118ec7056ebc54d",
            "base_class": "cmdb_ci_availability_zone",
            "dependent_class": "cmdb_ci_network"
        },
        {
            "relationship": "parent:f67e9ecdff602000dada361332f49d35",
            "base_class": "cmdb_ci_disk",
            "dependent_class": "cmdb_ci_file_system"
        },
        {
            "relationship": "parent:a99d39118f10310091769012cbbe4429",
            "base_class": "cmdb_ci_endpoint",
            "dependent_class": "cmdb_ci_application_cluster"
        },
        {
            "relationship": "child:60bc4e22c0a8010e01f074cbe6bd73c3",
            "base_class": "cmdb_ci_web_application",
            "dependent_class": "cmdb_ci_app_server_jboss"
        },
        {
            "relationship": "child:aa9434870ab301544ce2943bf03fd7a8",
            "base_class": "cmdb_ci_esx_server",
            "dependent_class": "cmdb_ci_vmware_instance"
        },
        {
            "relationship": "child:a99d39118f10310091769012cbbe4429",
            "base_class": "cmdb_ci_cluster",
            "dependent_class": "cmdb_ci_cluster_node"
        },
        {
            "relationship": "parent:bf83653c0ab30150761028c73a4de0f4",
            "base_class": "cmdb_ci_vcenter",
            "dependent_class": "cmdb_ci_vcenter_datacenter"
        },
        {
            "relationship": "child:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_db_catalog",
            "dependent_class": "cmdb_ci_information_object"
        },
        {
            "relationship": "parent:55c913d3c0a8010e012d1563182d6050",
            "base_class": "cmdb_ci_esx_resource_pool",
            "dependent_class": "cmdb_ci_vmware_instance"
        },
        {
            "relationship": "parent:6afd799338a02000c18673032c71b87b",
            "base_class": "cmdb_ci_vcenter_datastore",
            "dependent_class": "cmdb_ci_esx_server"
        },
        {
            "relationship": "parent:aa9434870ab301544ce2943bf03fd7a8",
            "base_class": "cmdb_ci_vmware_instance",
            "dependent_class": "cmdb_ci_esx_server"
        },
        {
            "relationship": "child:1bb40e370a0a0b323d85a1ce84f8feae",
            "base_class": "cmdb_ci_vmware_instance",
            "dependent_class": "cmdb_ci_linux_server"
        },
        {
            "relationship": "child:55c95bf6c0a8010e0118ec7056ebc54d",
            "base_class": "cmdb_ci_ucs_rack_unit",
            "dependent_class": "cmdb_ci_ucs_equipment"
        },
        {
            "relationship": "parent:c6fd799338a02000c18673032c71b81d",
            "base_class": "cmdb_ci_vcenter_datastore",
            "dependent_class": "cmdb_ci_vmware_template"
        },
        {
            "relationship": "parent:a99d39118f10310091769012cbbe4429",
            "base_class": "cmdb_ci_cluster_node",
            "dependent_class": "cmdb_ci_cluster"
        },
        {
            "relationship": "parent:85d98503ff100200d699ffffffffff8c",
            "base_class": "cmdb_ci_cluster_vip",
            "dependent_class": "cmdb_ci_win_cluster_node"
        },
        {
            "relationship": "parent:281d7566f1571100a92eb60da2bce50d",
            "base_class": "cmdb_ci_lb_netscaler",
            "dependent_class": "cmdb_ci_ip_switch"
        },
        {
            "relationship": "parent:55c95bf6c0a8010e0118ec7056ebc54d",
            "base_class": "cmdb_ci_vcenter_folder",
            "dependent_class": "cmdb_ci_vmware_template"
        },
        {
            "relationship": "child:60bc4e22c0a8010e01f074cbe6bd73c3",
            "base_class": "cmdb_ci_server",
            "dependent_class": "cmdb_ci_appl"
        },
        {
            "relationship": "parent:60bc4e22c0a8010e01f074cbe6bd73c3",
            "base_class": "cmdb_ci_appl",
            "dependent_class": "cmdb_ci_win_server"
        },
        {
            "relationship": "child:de5aeb6a0ab3015854626f204fb7b1c0",
            "base_class": "cmdb_ci_hyper_v_server",
            "dependent_class": "cmdb_ci_hyper_v_resource_pool"
        },
        {
            "relationship": "parent:281d7566f1571100a92eb60da2bce50d",
            "base_class": "cmdb_ci_win_server",
            "dependent_class": "cmdb_ci_ip_switch"
        },
        {
            "relationship": "parent:55c95bf6c0a8010e0118ec7056ebc54d",
            "base_class": "cmdb_ci_app_server_websphere",
            "dependent_class": "cmdb_ci_websphere_cell"
        },
        {
            "relationship": "child:55c913d3c0a8010e012d1563182d6050",
            "base_class": "cmdb_ci_hyper_v_server",
            "dependent_class": "cmdb_ci_hyper_v_cluster"
        },
        {
            "relationship": "child:c6fd799338a02000c18673032c71b81d",
            "base_class": "cmdb_ci_vmware_template",
            "dependent_class": "cmdb_ci_vcenter_datastore"
        },
        {
            "relationship": "parent:f67e9ecdff602000dada361332f49d35",
            "base_class": "cmdb_ci_nas_file_system",
            "dependent_class": "cmdb_ci_iscsi_disk"
        },
        {
            "relationship": "parent:3deab95338a02000c18673032c71b876",
            "base_class": "cmdb_ci_hyper_v_instance",
            "dependent_class": "cmdb_ci_hyper_v_network"
        },
        {
            "relationship": "parent:281d7566f1571100a92eb60da2bce50d",
            "base_class": "cmdb_ci_aix_server",
            "dependent_class": "cmdb_ci_ip_switch"
        },
        {
            "relationship": "parent:f67e9ecdff602000dada361332f49d35",
            "base_class": "cmdb_ci_nginx_web_server",
            "dependent_class": "cmdb_ci_lb_nginx"
        },
        {
            "relationship": "parent:f67e9ecdff602000dada361332f49d35",
            "base_class": "cmdb_ci_file_system",
            "dependent_class": "cmdb_ci_storage_device"
        },
        {
            "relationship": "parent:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_apache_web_server",
            "dependent_class": "cmdb_ci_app_server_tomcat"
        },
        {
            "relationship": "parent:281d7566f1571100a92eb60da2bce50d",
            "base_class": "cmdb_ci_lb_alteon",
            "dependent_class": "cmdb_ci_ip_switch"
        },
        {
            "relationship": "child:bf83653c0ab30150761028c73a4de0f4",
            "base_class": "cmdb_ci_vcenter_datacenter",
            "dependent_class": "cmdb_ci_vcenter"
        },
        {
            "relationship": "child:e81e87c30a0a0aa7002dd03d09af0f6a",
            "base_class": "cmdb_ci_vm_zones",
            "dependent_class": "cmdb_ci_computer_room"
        },
        {
            "relationship": "parent:41008aa6ef32010098d5925495c0fb94",
            "base_class": "cmdb_ci_business_app",
            "dependent_class": "cmdb_ci_service"
        },
        {
            "relationship": "parent:60bc4e22c0a8010e01f074cbe6bd73c3",
            "base_class": "cmdb_ci_app_server_jboss",
            "dependent_class": "cmdb_ci_web_application"
        },
        {
            "relationship": "parent:1a9cb166f1571100a92eb60da2bce5c5",
            "base_class": "cmdb_ci_information_object",
            "dependent_class": "cmdb_ci_config_file"
        },
        {
            "relationship": "parent:55c913d3c0a8010e012d1563182d6050",
            "base_class": "cmdb_ci_win_cluster",
            "dependent_class": "cmdb_ci_win_cluster_node"
        },
    ];
}
