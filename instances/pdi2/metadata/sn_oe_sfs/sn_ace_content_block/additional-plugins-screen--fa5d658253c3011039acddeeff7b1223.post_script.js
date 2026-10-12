(function(context) {
    context.props_details.links = [{
            "label": "Field Service Management",
            "url": "https://store.servicenow.com/sn_appstore_store.do#!/store/application/b7d7aa2ab7ae10105f48228dce11a9d5",
            "plugin_id": "com.sn_fsm.virtualagent"
        },
        {
            "label": "Governance and Risk Management",
            "url": "https://store.servicenow.com/sn_appstore_store.do#!/store/application/e00c596e539333004714ddeeff7b1208",
            "plugin_id": "com.sn_grc_virt_agent"
        },
        {
            "label": "Project Portfolio Management",
            "url": "https://store.servicenow.com/sn_appstore_store.do#!/store/application/1fc89d065321101023beddeeff7b123c",
            "plugin_id": "com.snc.ppm_virtualagent"
        },
        {
            "label": "Legal Service Management",
            "url": "https://store.servicenow.com/sn_appstore_store.do#!/store/application/432a0027dc231010fa9bd014d30fd954",
            "plugin_id": "com.sn_lg_virtual_agent"
        },
        {
            "label": "Instance Security",
            "url": "https://store.servicenow.com/sn_appstore_store.do#!/store/application/ff6f61b0fb55b0108a81a87be6dd619c",
            "plugin_id": "com.snc.isc_virtual_agent"
        }
    ].map(function(link) {
        if (!GlidePluginManager.isActive(link.plugin_id))
            return link;
    });
})(context);
