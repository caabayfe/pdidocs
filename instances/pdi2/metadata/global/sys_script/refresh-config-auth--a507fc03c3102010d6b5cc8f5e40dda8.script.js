
         (function executeRule(current, previous /*null when async*/) {
        var endpoint = new GlideRecord("sys_service_endpoint");
        endpoint.addQuery("authentication", current.getUniqueValue());
        endpoint.query();
        while (endpoint.next()) {
            sn_internal_services.ServiceConfig.refreshInCluster(endpoint.service.name);
        }
})(current, previous);
