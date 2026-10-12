if (!pm.isZboot()) {
    gs.info("Fix Script: Started CMDB Update field attribute allow_public for tables: cmdb_class_user_preference and cmdb_group_contains_encoded_query");

    SNC.DictionaryAttribute.set('cmdb_class_user_preference', 'class', 'allow_public', 'true');
    SNC.DictionaryAttribute.set('cmdb_group_contains_encoded_query', 'class', 'allow_public', 'true');
	
    gs.info("Fix Script: Finsihed CMDB Update field attribute allow_public for tables: cmdb_class_user_preference and cmdb_group_contains_encoded_query");
}
