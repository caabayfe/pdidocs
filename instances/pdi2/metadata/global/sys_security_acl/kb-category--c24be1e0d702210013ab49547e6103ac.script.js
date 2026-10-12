answer = new KBCategory().canCreate(current.parent_id);

if (!answer && gs.getProperty('com.glide.applyQueryString.enforce_create_acl') === 'true') {
	answer = new KBCategory().canCreate(parent.sys_id);
}
