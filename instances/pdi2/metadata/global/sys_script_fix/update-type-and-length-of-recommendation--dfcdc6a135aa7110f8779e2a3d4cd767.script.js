updateRecommendation("ml_label_candidate");
updateRecommendation("ml_labeled_data");


function updateRecommendation(tableName) {
    var gr = new GlideRecord("sys_dictionary");
    gr.addQuery("name", tableName);
    gr.addQuery("element", "recommendation");
    gr.query();

    if (gr.next()) {
        gr.setValue("internal_type", "string");
        gr.setValue("max_length", "200");
        gr.setValue("choice", "");
        gr.update();
    }
}
