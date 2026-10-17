(function executeRule(gr) {

      gr.model_table = "wf_activity_definition";
      if (!gs.nil(gr.model))
        gr.model_id = gr.model;
      if (!gs.nil(gr.model_id))
        gr.model = gr.model_id;

    })(current);
