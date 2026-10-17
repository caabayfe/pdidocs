var url = gs.getXMLText(current.payload, "//url");
var company = gs.getXMLText(current.payload, "//company") ;
var email = gs.getXMLText(current.payload, "//email") ;
var first = gs.getXMLText(current.payload, "//first_name") ;
var last = gs.getXMLText(current.payload, "//last_name") ;
var phone = gs.getXMLText(current.payload, "//phone") ;
var desc = "URL: <a href='http://www.service-now.com/" + url + "/'>http://www.service-now.com/" + url + "/</a>\n"
 + "Company: " + company + "\n"
 + "Email: " + email + "\n"
 + "First name: " + first + "\n"
 + "Last name: " + last + "\n"
 + "Phone: " + phone + "\n";

// register with the HI server, use WS for portability
//var wsdl = "http://www.service-now.com/hi/registration.do?WSDL";
var wsdl = "http://localhost:8080/glide/registration.do?WSDL";

var wsClient = new WSClientAdaptor(wsdl);
wsClient.setMethodName("insert");
wsClient.setParameter("company", company);
wsClient.setParameter("email", email);
wsClient.setParameter("first_name", first);
wsClient.setParameter("last_name", last);
wsClient.setParameter("phone", phone);
wsClient.setParameter("comments", "brought to you by your neighborhood install_snc.hta");
var sys_id = wsClient.invokeFiltered("//sys_id");

// create cmdb_ci_service
var s = new GlideRecord("cmdb_ci_service");
s.initialize();
s.name = "SNC instance - " + url;
s.operational_status = "2";
s.comments = desc;
var cmdb_sysID = s.insert();

// create requested by
var r = new GlideRecord("sys_user");
r.initialize();
r.first_name = first;
r.last_name = last;
r.email = email;
r.phone = phone;
r.notification = "2";
r.source = "install_snc.hta";
r.locked_out = "true";
var user_sysID = r.insert();

// create request
var c = new GlideRecord("change_request"); 
c.initialize(); 
c.cmdb_ci = cmdb_sysID;
c.requested_by = user_sysID;
c.approval = "requested";
c.state = "2"; // Work in progress
c.category = "Service-now Deployment";
c.short_description = "New system deploy requested for: " + url;

c.description = desc;

c.insert();

current.processed = gs.nowDateTime();
current.update();
