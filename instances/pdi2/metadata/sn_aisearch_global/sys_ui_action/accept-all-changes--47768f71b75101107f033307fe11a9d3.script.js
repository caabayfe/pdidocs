var query = "state=needs_review^migration_orchestration=" + current.getUniqueValue();

var changesGr = new GlideRecord('sn_aisearch_global_job_staging');
changesGr.addQuery(query);
changesGr.setValue('state', 'accept');
changesGr.updateMultiple();

gs.addInfoMessage(gs.getMessage('All changes moved to accepted state'));

var url = current.getTableName() + '.do?sys_id=' + current.sys_id.toString() + '&sysparm_view=default';
gs.action.setRedirectURL(url);
