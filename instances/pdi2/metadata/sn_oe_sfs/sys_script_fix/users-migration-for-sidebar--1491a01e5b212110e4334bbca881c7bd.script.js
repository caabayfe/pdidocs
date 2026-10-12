migrateUsersForSidebar();
function migrateUsersForSidebar() {
    gs.info('Sidebar Users migration started');
    var collabUser = new GlideRecord('sys_cs_collab_user');
    var CHANNEL_TEAMS = 'a812eaf8c32111100f24c87af040dd59';
    var USER_TABLE = 'sys_user';
    collabUser.addQuery('create_external_conversation', 'true');
    collabUser.addQuery('external_user', 'false');
    collabUser.query();
    while(collabUser.next()) {
	var collabConfig = new GlideRecord('sys_cs_collab_config');
	collabConfig.setValue('channel', CHANNEL_TEAMS);
	collabConfig.setValue('create_external_conversation', 'true');
	collabConfig.setValue('parent_table', USER_TABLE);
	collabConfig.setValue('parent_document', collabUser.getValue('user'));
	collabConfig.insert();
    }
    gs.info('Sidebar Users migration completed');
}
