var startTime = new GlideDateTime();
var log = function(logMsg) {
	gs.log(logMsg, 'domain_directory_job');
};
log('Started domain_directory field size update job');
var tables = [
	'cmdb_ci_appl_glassfish',
	'cmdb_ci_appl_peoplesoft',
	'cmdb_ci_app_server_weblogic',
	'cmdb_ci_endpoint_weblogic_module',
	'cmdb_ci_appl_weblogic_jms'
];

var maxLength = 1024;
var columnName = 'domain_directory';
tables.forEach(function (table, idx){
	updateFieldLength(table, columnName, maxLength);
});

function updateFieldLength(tableName, fieldName, maxLength) {
	var gr = new GlideRecord("sys_dictionary");
	gr.addQuery("name", tableName);
	gr.addQuery("element", fieldName);
	gr.addQuery("max_length", "<", maxLength);
	gr.query();
	if (gr.next()) {
		log("started updating Table: " + gr.getValue('name') + " Field: " + gr.getValue("element") + " Max Length: " + maxLength);
		gr.setValue('max_length', maxLength);
		gr.update();
	}
}
var endTime = new GlideDateTime();
var totalTime = GlideDateTime.subtract(startTime, endTime).getDurationValue();
log('Completed domain_directory field size update job, Total Time: '+totalTime);
