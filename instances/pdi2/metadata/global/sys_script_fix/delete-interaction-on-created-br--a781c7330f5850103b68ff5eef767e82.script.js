var gr = new GlideRecord("sys_script");
if (gr.get("049dcda33b302300a0bd8cd834efc4e3")) {
    gr.active = false;
    gr.update();
}
