var gr = new GlideRecord('nlq_query_log');
var bnf = "BNF";
var outputSource = "output_source";
gr.addNullQuery(outputSource);
gr.query();
while (gr.next()) {
    gr.setValue(outputSource, bnf);
    gr.setWorkflow(false);
    gr.update();
}
