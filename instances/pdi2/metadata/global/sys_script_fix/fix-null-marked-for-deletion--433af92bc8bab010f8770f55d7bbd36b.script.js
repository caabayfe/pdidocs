var gr = new GlideRecord('ais_search_profile_ais_dictionary_m2m');
gr.addQuery('marked_for_deletion', null);
gr.query();
while (gr.next()) {
    gr.setValue('marked_for_deletion', false);
    gr.update();
}
