var gr = new GlideRecord('db_audio');
if (gr.get('a0b698b09f201200d5f9b3e2957fcf88')) {
  gs.print("db_audio record found");
  if (!gr.getValue("audio")) {
    gs.print("audio field empty — updating");
    gr.setValue("audio", "14c698b09f201200d5f9b3e2957fcf34");
    gr.update();
  }
}
