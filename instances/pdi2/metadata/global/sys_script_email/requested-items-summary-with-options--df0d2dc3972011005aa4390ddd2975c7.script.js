  template.print("Summary of Requested items:<br />");  
  var item = new GlideRecord("sc_req_item");
  item.addQuery("request", current.sysapproval);
  item.query();
  while(item.next()) {
      template.print(item.number + ":  " + item.quantity + " X " + item.cat_item.getDisplayValue() + " at " + item.cat_item.price.getDisplayValue() + " each <br />");
      template.print("    Options:<br />");
      var keys = [];
      var set = new GlideappVariablePoolQuestionSet();	
      set.setRequestID(item.sys_id);
      set.load();
      var vs = set.getFlatQuestions();
      for (var i=0; i < vs.size(); i++) {
        if(vs.get(i).getLabel() != '') {
           template.space(4);
           template.print('     ' +  vs.get(i).getLabel() + " = " + vs.get(i).getDisplayValue() + "<br />");  
        }
      }
  }
