 answer = gs.getProperty('com.glide.applyQueryString.enforce_create_acl') === 'true' ? new KBCategory().canCreate(parent.sys_id) : true; 
