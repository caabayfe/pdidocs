var url = gs.getXMLText(current.payload, "//url");
var warfile = gs.getXMLText(current.payload, "//war") ;

// create the instance with the next available port on this host
var sa = new SecurelyAccess("com.glideapp.deploy", "shell.scripts/create-instance.sh");
sa.setBackground(true);
sa.setQuiet(false);
sa.runCommand([url, "next", warfile]);

// reply confirmation
var wsdl = "http://hi.service-now.com/ecc_queue.do?WSDL";
var myname = gs.getProperty("glide.db.name");

wsClient = new WSClientAdaptor(wsdl);
wsClient.setMethodName("insert");
wsClient.setParameter("agent", "Service-now deployer");
wsClient.setParameter("name", "system.deploy.confirm");
wsClient.setParameter("source", myname);
wsClient.setParameter("queue", "input");
wsClient.setParameter("payload", current.payload);

sys_id = wsClient.invokeFiltered("//sys_id");

current.processed = gs.nowDateTime();
current.update();
