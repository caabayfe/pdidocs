var wsdl = current.topic;
var method = current.name;
var xpath = current.source;

var client = new GlideWSClient(wsdl);
client.setMethodName(method);

// iterate parameters
var xmlutil = GlideXMLUtil;
var doc = xmlutil.parse(current.payload);
var nodelist = xmlutil.selectNodes(doc, "//parameter");
for (var i = 0; i < nodelist.getLength(); i++) {
  var node = nodelist.item(i);
  var name = xmlutil.getAttribute(node, "name");
  var value = xmlutil.getText(node);
  client.setParameter(name, value);
}

// if the method name has '.' in it, it is a
// method name selector and we want to override
// the parent element
var methodArray = method.toString().split(".");
if (methodArray.length == 2)
  client.setParentElementName(methodArray[1]);

var result = client.invoke(xpath);

var newCurrent = new GlideRecord("ecc_queue");
newCurrent.initialize();
newCurrent.topic = current.topic;
newCurrent.name = current.name;
newCurrent.source = current.source;
newCurrent.payload = result;
newCurrent.state = "ready";
newCurrent.queue = "input";
newCurrent.agent = "WSDLClient";
newCurrent.response_to = current.sys_id;
newCurrent.insert();

current.state = "processed";
current.processed = gs.nowDateTime();
