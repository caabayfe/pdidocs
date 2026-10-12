(function executeRule(current, previous /*null when async*/) {
	sn_vcs.SourceControl.deleteLocalRepositoryOnCurrentNode(current.sys_id);
})(current, previous);  
