answer = new KBCategory().canWrite(current.parent_id);

if (!answer && gs.getProperty('com.glide.applyQueryString.enforce_create_acl') === 'true') {
	answer = new KBCategory().canWrite(parent.sys_id);
}
