var answer = false;
if (current.benchmarking == false)
	answer = new SNC.PADomainUtils().isWriteable("sysauto_pa", current.sys_id);
answer;
