var gr = new GlideRecord("sys_dictionary");
    gr.addQuery("name", "open_nlu_predict_log");
    gr.addQuery("element", "utterance");
    gr.setWorkflow(false);
    gr.query();

    if(gr.next()) {
        gr.setValue("max_length", "512");
        gr.update();
    }
