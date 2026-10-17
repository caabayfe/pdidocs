var uri = action.getGlideURI();
var path = uri.getFileFromPath();
var collectionId = uri.get('sysparm_collectionID');
var collectionKey = uri.get('sysparm_collection_key');

uri.set('sysparm_m2m_ref', 'asmt_m2m_category_assessment');
uri.set('sysparm_stack', 'no');

var targetTable = null;
if (collectionKey == 'category') //We are editing from a assessment category form
	targetTable = 'asmt_metric_category';
else if (collectionKey == 'assessment_record') //We are editing from a assessable record form
	targetTable = 'asmt_assessable_record';

if (targetTable != null) {
	var categoryRecord = new GlideRecord(targetTable);
	if (categoryRecord.get(collectionId))
		uri.set('sysparm_query', 'metric_type=' + categoryRecord.metric_type);
} else if (uri.get('sysparm_view') == 'vendor') { //if we are on a vendor view,then use the vendor metric type.
	uri.set('sysparm_query', 'metric_type=881df17dd7240100fceaa6859e610366');
}

if (collectionKey == '') {
    uri.set('sysparm_collection', 'asmt_assessable_record');
    uri.set('sysparm_collection_key', 'assessment_record');
    uri.set('sysparm_collection_label', 'Category');
    uri.set('sysparm_collection_related_field', 'category');
    uri.set('sysparm_collection_related_file', 'asmt_metric_category');
    uri.set('sysparm_collection_relationship', '');
}

action.setRedirectURL(uri.toString('sys_m2m_template.do'));
