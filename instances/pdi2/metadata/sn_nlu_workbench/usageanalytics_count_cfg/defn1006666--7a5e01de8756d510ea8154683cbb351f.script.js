var encodedQuery = 'sys_created_onONLast month@javascript:gs.beginningOfLastMonth()@javascript:gs.endOfLastMonth()^nlu_provider=64c023c17300330021a044764df6a70e';
answer = new sn_nlu_workbench.NLUPerformanceUtil().getAuditLogs('INCORRECT_AMONG_MULTIPLE', encodedQuery).length;
