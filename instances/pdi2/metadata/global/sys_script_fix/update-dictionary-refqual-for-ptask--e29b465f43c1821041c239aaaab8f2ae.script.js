updateColumnRefQual();

function updateColumnRefQual() {
    var gr = new GlideRecord("sys_dictionary");
    gr.addEncodedQuery("reference_qual_conditionISEMPTY^dynamic_ref_qualISEMPTY^reference_qualISEMPTY^name=problem_task^element=problem");
    gr.setWorkflow(false);
    gr.query();
    if (gr.next()) {
        gr.setValue("use_reference_qualifier", "advanced");
        gr.setValue("reference_qual", "javascript:ProblemTaskModel.getRefQualForParent(current);");
        gr.update();
    }
}
