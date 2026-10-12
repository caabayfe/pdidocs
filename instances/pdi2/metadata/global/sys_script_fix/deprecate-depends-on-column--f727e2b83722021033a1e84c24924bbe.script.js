var gr = new GlideRecord('one_api_service_plan_feature');
gr.addEncodedQuery('depends_on_list=NULL^depends_on!=NULL');
gr.query();
while (gr.next()) {
    gr.setValue('depends_on_list', gr.getValue('depends_on'));
    gr.update();
}
