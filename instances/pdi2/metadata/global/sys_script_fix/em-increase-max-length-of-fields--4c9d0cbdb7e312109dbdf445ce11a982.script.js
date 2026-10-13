var log = 'EM - increase max length of fields starting\n';

const DICTIONARY_TABLE = 'sys_dictionary';
const TABLE_NAME = 'sa_resource_ci_metric_type';

const RESOURCE_TYPE_ELEMENT = 'resource_type';
const CMDB_CI_TYPE_ELEMENT = 'ci_type';

const UPDATED_BY_FIELD = 'sys_updated_by';
const SYSTEM_UPDATER_LIST = 'admin,system';

const MAX_LENGTH = 255;

//MAIN FLOW
process();

//FUCNTIONS
function process() {
    var startTime = new Date();

	setFieldSize(CMDB_CI_TYPE_ELEMENT, MAX_LENGTH);
	setFieldSize(RESOURCE_TYPE_ELEMENT, MAX_LENGTH);

    var endTime = new Date();
    var elapsedTime = endTime - startTime;
    log += 'Total time elapsed for EM - increase max length of fields script running in ms: ' + elapsedTime + "\n";
	gs.error(log);
	log = '';
}



function setFieldSize(element, size) {
    var gr = new GlideRecord(DICTIONARY_TABLE);
    gr.addQuery("name", TABLE_NAME);
    gr.addQuery("element", element);
	gr.addQuery(UPDATED_BY_FIELD, 'IN', SYSTEM_UPDATER_LIST);
    gr.query();

    if (gr.next()) {
        gr.setValue("max_length", size);
        gr.update();
		log += "The sa_resource_ci_metric_type." + element + " max_length updated to " + size + " by fix script\n";
	}
	else {
		log += "The sa_resource_ci_metric_type." + element + " max_length was NOT updated to " + size + " by fix script\n";
	}
}
