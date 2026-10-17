  var keys = [];
  var set = new GlideappSequencedQuestionSet();
  set.setTableName(current.sysapproval.sys_class_name);
  set.setTableSysID(current.sysapproval);
  set.load();
  var vs = set.getFlatQuestions();
  if (vs.size() > 0)
     printVariables(vs);

  function printVariables(vs) {
    template.space(4);
    template.print("Summary of Change request:<br />");

    for (var i=0; i < vs.size(); i++) {
         if(vs.get(i).getLabel() != '') 
            template.space(4);
            template.print('     ' +  vs.get(i).getLabel() + " = " + vs.get(i).getDisplayValue() + "<br />");  
    }
  }
