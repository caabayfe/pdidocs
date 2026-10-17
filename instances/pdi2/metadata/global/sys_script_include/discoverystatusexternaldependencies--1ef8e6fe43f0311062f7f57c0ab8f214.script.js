var DiscoveryStatusExternalDependencies;

(function() {
    DiscoveryStatusExternalDependencies = {
        doesServiceMappingHaveWorkLeft: doesServiceMappingHaveWorkLeft,
        doesCmpHaveWorkLeft: doesCmpHaveWorkLeft,
        doesCloudResourceDiscoLaunchHaveWorkLeft: doesCloudResourceDiscoLaunchHaveWorkLeft
    };

    var LOGGER_NAME = 'DiscoveryStatusExternalDependencies',
        LOG_PREFIX = '[' + LOGGER_NAME + '][sys_script_include_1ef8e6fe43f0311062f7f57c0ab8f214]',
        nodeLogger = new sn_automation.AutomationAPI().getNodeLogger(LOGGER_NAME);

    function doesServiceMappingHaveWorkLeft(potentialStuckStatus) {
        if (!potentialStuckStatus || potentialStuckStatus.discover != 'Service')
            return;

        var gr = new GlideRecord('sa_endpoint_status');
        if (gr.isValid()) {
            gr.addQuery('discovery_status', potentialStuckStatus.sys_id + '');
            gr.addQuery('state', '!=', 4);
            gr.query();

            if (gr.hasNext()) {
                nodeLogger.debug(gs.getMessage('{0} {1}: Service Mapping still has work to do', [LOG_PREFIX, potentialStuckStatus.number]));
                return true;
            }
        }
    }

    function doesCmpHaveWorkLeft(potentialStuckStatus) {
        if (!potentialStuckStatus)
            return;
        var discover = potentialStuckStatus.discover + '';

        if (discover == 'Cloud Resources' || discover == 'Cloud' || discover == 'CIs') {
            //only when the CAPI related discovery is triggered, check for this condition
            var cloudOrderGr = new GlideRecord('sn_cmp_order');
            //exclude this check for vsphere
            cloudOrderGr.addQuery('resource', '!=', '5cc941360b632200e937c97193673a1a' /* V_SPHERE_RESOURCE_BLOCK */ );
            cloudOrderGr.addQuery('discovery_status', potentialStuckStatus.sys_id + '');
            // look for all orders related to the scan in 'processing' state
            cloudOrderGr.addQuery('status', 6);
            cloudOrderGr.setLimit(1);
            cloudOrderGr.query();

            // if any orders are in processing, bail
            if (cloudOrderGr.next()) {
                var orderStepGr = new GlideRecord('sn_cmp_order_step_status');
                orderStepGr.addQuery('order', cloudOrderGr.sys_id + '');
                orderStepGr.setLimit(2);
                orderStepGr.query();

                if (orderStepGr.getRowCount() > 1) {
                    nodeLogger.debug(gs.getMessage('{0} {1}: CMP still has work to do', [LOG_PREFIX, potentialStuckStatus.number]));
                    return true;
                }
            }
        }
    }

    function doesCloudResourceDiscoLaunchHaveWorkLeft(potentialStuckStatus) {
        if (!potentialStuckStatus)
            return;

        var discoStatusId = potentialStuckStatus.sys_id + '';
        var discover = potentialStuckStatus.discover + '';

        if (discover == 'Cloud Resources') {
            var sysTriggerGr = new GlideRecord('sys_trigger');
            sysTriggerGr.addQuery('document', 'Cloud Appln Pattern Launcher:' + discoStatusId);
            sysTriggerGr.addQuery('document_key', discoStatusId);
            sysTriggerGr.setNoCount();
            sysTriggerGr.limit(1);
            sysTriggerGr.query();

            if (sysTriggerGr.hasNext()) {
                nodeLogger.debug(gs.getMessage('{0} {1}: Cloud Resource Discovery Launch still has work to do', [LOG_PREFIX, potentialStuckStatus.number]));
                return true;
            }
        }
        return false;
    }

})();
