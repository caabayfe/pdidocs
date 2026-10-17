var serviceName = current.name;
var escServiceName = GlideStringUtil.escapeHTML(serviceName);
sn_internal_services.ServiceConfig.refreshInCluster(escServiceName);
gs.addInfoMessage(gs.getMessage("Refreshed connection for service {0}", escServiceName));
