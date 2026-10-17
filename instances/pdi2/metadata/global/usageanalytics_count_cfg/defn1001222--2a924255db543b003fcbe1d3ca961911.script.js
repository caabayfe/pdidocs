answer = JSON.stringify(getInstanceConfigForCredentiallessDisco());

function getInstanceConfigForCredentiallessDisco() {
var result = {};
var PROPERTIES_TABLE = "sys_properties";

if (!GlideTableDescriptor.isValid(PROPERTIES_TABLE)) {
return result;
}

var PROPERTY_NAME = "mid.discovery.credentialless.enable";
var count = 0;
var arrayOfMappings = [];

function getCredentialLessDiscoveryMap() {
var resultMap = {};
var propertyTable = new GlideRecord(PROPERTIES_TABLE);
propertyTable.addQuery("name", PROPERTY_NAME);
propertyTable.query();
if (propertyTable.next()) {
count = ++count;
resultMap[PROPERTY_NAME] = propertyTable.value + '';
} else
resultMap[PROPERTY_NAME] = "";

return resultMap;
}

arrayOfMappings.push(getCredentialLessDiscoveryMap());
result['instance_config'] = arrayOfMappings;
result['count'] = count;

return result;
}
