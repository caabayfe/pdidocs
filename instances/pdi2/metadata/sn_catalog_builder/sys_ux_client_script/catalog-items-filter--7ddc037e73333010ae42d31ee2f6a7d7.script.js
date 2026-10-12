function evaluateProperty({api}) {
  const filterMode = api.data.fetch_catalog_filter_data.output.itemFilterMode;
  const userId = api.context.session.user.sys_id;
  const roles = api.context.session.user.roles;
  const publishedItemsQuery = 'sys_class_name=sc_cat_item^ORsys_class_name=sc_cat_item_producer^state=published^ORstate=^active=true^checked_out=false^ORchecked_out=';
  const draftItemsQuery = 'sys_class_name=sc_cat_item^ORsys_class_name=sc_cat_item_producer^stateINdraft,publishing,in_review^ORDERBYDESCsys_updated_on';
  const defaultFilter = publishedItemsQuery + '^NQ' + draftItemsQuery;
  const secondaryOwnerUC = api.data.fetch_catalog_filter_data.output.userMatchingSecondaryOwnerCriteria;
  if (roles.indexOf('admin') >= 0 || roles.indexOf('catalog_admin') >= 0) {
	  // If admin/catalog_admin return all catalog items and record producers which are published
	  return defaultFilter;
  }
  if (filterMode == 'owner_only')
     return 'owner=' + userId + '^ORsecondary_ownersIN' + secondaryOwnerUC + '^' + publishedItemsQuery + '^NQ' + 'owner=' + userId + '^ORsecondary_ownersIN' + secondaryOwnerUC + '^' + draftItemsQuery;
  else if (filterMode == 'catalog_editor')
	return 'sc_catalogsLIKEjavascript:getMyItems()^' + publishedItemsQuery + '^NQ' + 'sc_catalogsLIKEjavascript:getMyItems()^' + draftItemsQuery;
  else
	return defaultFilter;
}
