var gr = new GlideRecord("sys_app_module");
gr.setWorkflow(false);
if (gr.get("73180c4ac37201106bedccbfea40ddd8")) {
    gr.deleteRecord();
}
