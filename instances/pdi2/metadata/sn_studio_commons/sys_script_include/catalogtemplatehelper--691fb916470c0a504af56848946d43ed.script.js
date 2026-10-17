class CatalogTemplateHelper {
	/**
	 * @param {string} tableName - catalog item or record producer table name
	 * @returns {array} Standard catalog and standard record producer template
	 */
	static getCatalogTemplates(tableName) {
		const templateNameToTableMap = {
			sc_cat_item: 'Catalog Item Builder',
			sc_cat_item_producer: 'Record Producer Builder',
		};
		let templateGR = new GlideRecord('sc_template');
		let filteredRecords = [];
		const templateName = templateNameToTableMap[tableName];
		if (templateName) {
			templateGR.addQuery('cat_item.name', templateName);
			templateGR.query();
			while (templateGR.next()) {
				const template = new sn_sc.CatalogTemplate(templateGR.sys_id);
				if (template.canUse()) {
					filteredRecords.push({
						title: templateGR.getDisplayValue('name'),
						catalog_item: templateGR.getDisplayValue('cat_item'),
						description: templateGR.getDisplayValue('short_description'),
						sysId: templateGR.getValue('sys_id'),
					});
				}
			}
		}
		return filteredRecords;
	}
}
