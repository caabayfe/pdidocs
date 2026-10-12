// Get outages where matching affected ci's
current.addNullQuery('end').addOrCondition('end', '>=', parent.start);
current.addQuery('begin', '<=', parent.end);
var cmdbCiJoin = current.addJoinQuery('cmdb_outage_ci_mtom', 'sys_id', 'outage');
cmdbCiJoin.addCondition('ci_item', parent.service_offering).addOrCondition('ci_item', parent.cmdb_ci);
var cmdbCiNotNullJoin = current.addJoinQuery('cmdb_outage_ci_mtom', 'sys_id', 'outage');
cmdbCiNotNullJoin.addCondition('ci_item', '!=', null);

// Get outages where matching CMDB_CI field
var gr = new GlideRecord('cmdb_ci_outage');
gr.addNullQuery('end').addOrCondition('end', '>=', parent.start);
gr.addQuery('begin', '<=', parent.end);
gr.addQuery('cmdb_ci','!=', null);
gr.addQuery('cmdb_ci', parent.service_offering).addOrCondition('cmdb_ci', parent.cmdb_ci);

// ^NQ is new query, acts like (query1) or (query2)
current.addEncodedQuery('^NQ' + gr.getEncodedQuery());
