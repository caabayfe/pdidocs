var parentRecord = new SncMetadataParentGetter().getParent(current);
action.setRedirectURL(parentRecord);
action.setReturnURL("sys_metadata.do?sysparm_ignore_class=true&sys_id=" + current.sys_id.toString());
