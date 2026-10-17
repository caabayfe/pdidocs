
var map = { 'name': 'com.glide.engine.event_handler_system_id',
'value': 'PRIMARY NODES',
'sys_policy': 'read',
'ignore_cache': true,
'description': 'This property controls flow designer parent job System ID. The value of this property should be PRIMARY NODES. Please contact Service Now before deleting or changing this property.'};
if(GlidePluginManager.isZboot()){
	var property = new GlideRecord('sys_properties');

        for (var entry in map) {
         property.setValue(entry,map[entry]);
        }
	property.insert();
} else {
var script = "var property = new GlideRecord('sys_properties'); \n";


        for (var entry in map) {
         script = script +  "property.setValue('"+entry+"', '"+map[entry]+"'); \n";
        }

script = script + "property.insert(); \n";

var when = new GlideDateTime();
 when.addSeconds(60 * 60); // An hour
GlideRunScriptJob.scheduleScript(script,'FlowDesigner: Change Job SystemId', when);
}
