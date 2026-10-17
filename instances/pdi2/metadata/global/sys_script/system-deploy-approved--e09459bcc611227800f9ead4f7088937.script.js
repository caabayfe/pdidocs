// redirect to appropriate box for instance creation - CHANGE ME
// wsdl = "http://www.service-now.com/sac3_monitor/ecc_queue.do?WSDL";
wsdl = "http://localhost:8080/glide/ecc_queue.do?WSDL";

var cmdb_sysID = current.cmdb_ci;

var url = current.cmdb_ci.getDisplayValue();
var urlStr = new String(url);

urlStr = urlStr.split(" - ")[1];

var warfile = "glide.war"; // CHANGE ME

var myname = gs.getProperty("glide.db.name");

wsClient = new WSClientAdaptor(wsdl);
wsClient.setMethodName("insert");
wsClient.setParameter("agent", "Service-now deployer");
wsClient.setParameter("name", "system.deploy.create");
wsClient.setParameter("queue", "input");
wsClient.setParameter("source", myname);
wsClient.setParameter("payload", "<deploy><cmdb>" + cmdb_sysID + "</cmdb><url>" + urlStr + "</url><war>" + warfile + "</war></deploy>");

sys_id = wsClient.invokeFiltered("//sys_id");
