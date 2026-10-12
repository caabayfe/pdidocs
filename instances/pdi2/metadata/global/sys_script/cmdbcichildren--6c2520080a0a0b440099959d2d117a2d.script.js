function cmdbCIChildren() {
  var answer="sys_idIN";
  var l = SNC.CMDBUtil.getAllChildrenOfAsCommaList('cmdb_ci');
  answer = answer + l;
  gs.print(answer);
  return answer;
}
