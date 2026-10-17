var articles = 0;
if (GlideTableDescriptor.isValid('kb_knowledge') && GlideTableDescriptor.isValid('sn_customerservice_case')) {
  var count = new GlideAggregate('kb_knowledge');
  count.addJoinQuery('sn_customerservice_case', 'source', 'sys_id');
  count.addNotNullQuery('source');
  count.addAggregate('COUNT');
  count.query();
  if(count.next())
       articles = count.getAggregate('COUNT');
}
answer=articles;
