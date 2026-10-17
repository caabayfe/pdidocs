function func () {
        var gr = new GlideRecord("sn_atf_tg_sn_boq");
        gr.get(g_form.getUniqueValue());
        var root_tracker_id = gr.getValue("root_tracker_id");
        var url = "/now/nav/ui/classic/params/target/sys_atf_test_result_list.do%3Fsysparm_query%3Droot_tracker_id%253D" + root_tracker_id + "%255EORDERBYDESCend_time";
        window.open(url);
  }
