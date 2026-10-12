(function executeRule(current, previous /*null when async*/ ) {

    if (current == null || current.isNewRecord() || (gs.getProperty('taxonomy.category.content_auto_sync') === 'true')) {
        return;
    }

    var gr = new GlideAggregate('unconnected_category_content');
    gr.addQuery("topic", current.sys_id.toString());
    gr.addQuery("dismissed", false);
    gr.addAggregate("COUNT");
    gr.query();
    if (gr.next() && gr.getAggregate("COUNT") > 0) {
        var url = "unconnected_category_content_list.do?sysparm_query=topic=" + current.sys_id.toString();
        var infoMessage = gs.getMessage("There are updates in the associated catalog and knowledge content categories.  <a href='{0}' target='_blank'> View Details.</a>", url);
        gs.addInfoMessage(infoMessage);
    }

    if (gs.getProperty("taxonomy.category.new_feature_alert") === "true")
        gs.addInfoMessage(gs.getMessage("You can now view the <b>catalog and knowledge categories</b> that are associated with this topic. Whenever content in these categories is added or removed, you can review and update the topic accordingly"));

})(current, previous);
