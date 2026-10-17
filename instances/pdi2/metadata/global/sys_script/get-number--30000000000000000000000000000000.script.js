function getNextObjNumber() {
  var assignOnInsert = gs.getProperty("glide.itil.assign.number.on.insert");
  if (assignOnInsert == 'true') {
     if (current.sys_id.isNil()) {
        return null;
     }
  }

  var nm = new NumberManager(current.sys_meta.name);
  answer = nm.getNextObjNumber();

  if (assignOnInsert == 'true'&& current.sys_meta.name != 'sys_report_summary')
    gs.addInfoMessage(gs.getMessage('Number') + ' ' + answer + ' ' + gs.getMessage('was assigned to') + ' ' + current.sys_meta.label);

  return answer;
}
