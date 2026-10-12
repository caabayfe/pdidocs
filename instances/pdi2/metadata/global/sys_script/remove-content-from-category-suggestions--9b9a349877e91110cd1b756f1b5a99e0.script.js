(function executeRule(current, previous /*null when async*/ ) {

    var configRecord = current.content_type.getRefRecord();

    var gr = new GlideRecord("unconnected_category_content");
    gr.addQuery("content_type", current.content_type.toString());
    gr.addQuery("topic", current.topic);
    gr.addQuery(configRecord.getValue("content_reference_field"), current[configRecord.getValue("content_reference_field")]);
    gr.addQuery('update_type','added');
    gr.deleteMultiple();

})(current, previous);
