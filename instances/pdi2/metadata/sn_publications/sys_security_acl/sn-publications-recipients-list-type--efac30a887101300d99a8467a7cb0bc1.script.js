answer = execute();

function execute() {
	var isTypeAccessible = true;
    if (current.isNewRecord())
        return isTypeAccessible;
	var entityTable;
	var entityType = current.type;
	if (entityType == 'internal' || entityType == 'external')
		entityTable = 'sn_publications_recipientslist_user_m2m';
	if (entityType == 'consumers')
		entityTable = 'sn_publications_recipientslist_consumer_m2m';
	if (entityType == 'accounts')
		entityTable = 'sn_publications_recipientslist_account_m2m';
	
	var entityGr = new GlideRecord(entityTable);
	entityGr.addQuery('recipients_list',current.sys_id);
	entityGr.query();
	
	if (entityGr.hasNext())
		isTypeAccessible = false;
	return isTypeAccessible;
	 
}
