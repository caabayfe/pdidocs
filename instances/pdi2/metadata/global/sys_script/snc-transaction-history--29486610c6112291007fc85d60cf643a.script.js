//
// Send transaction history records back to the mother ship
//
wsdl = "http://hi.service-now.com/ecc_queue.do?WSDL";
//wsdl = "http://localhost:8080/glide/ecc_queue.do?WSDL";

var myname = gs.getProperty("glide.db.name");

wsClient = new WSClientAdaptor(wsdl);
wsClient.setMethodName("insert");
wsClient.setParameter("agent", "Service-now transaction history");
wsClient.setParameter("name", "transaction.history");
wsClient.setParameter("queue", "input");
wsClient.setParameter("source", myname);
wsClient.setParameter("payload", "<history><collected>" + current.collected + "</collected><count>" + current.value + "</count></history>");

sys_id = wsClient.invokeFiltered("//sys_id");
