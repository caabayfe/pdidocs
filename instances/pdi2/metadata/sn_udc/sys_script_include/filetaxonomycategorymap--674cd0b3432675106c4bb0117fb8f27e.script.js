class FileTaxonomyCategoryMap {
	static type = 'FileTaxonomyCategoryMap';
	static TABLE = 'sn_udc_file_taxonomy_type_category_m2m';
	static Column = {
		TaxonomyType: 'taxonomy_type',
	};

	/**
	 * Retrieves list of categories
	 * @returns {Array} array of categories
	 */
	static getCategories() {
		const categories = [];
		const gr = new GlideRecord(FileTaxonomyCategoryMap.TABLE);
		gr.query();

		while (gr.next()) {
			const category = gr.category.getRefRecord();
			if (!UDCUtil.isValidGlideRecord(category)) continue;

			categories.push({
				sysId: category.getUniqueValue(),
				label: category.getDisplayValue('label') || '',
				description: category.getDisplayValue('description') || '',
				icon: category.getDisplayValue('icon') || UDCConstants.fallbackIcons.CATEGORY,
				parentCategory: gr.getDisplayValue('parent_category') || null,
				parentCategorySysId: gr.getValue('parent_category'),
			});
		}
		return categories;
	}

	/**
	 * Retrieves all Categories with types for file structure
	 * @returns {Array} array of categories
	 */
	static getCategoriesForFileStructure() {
		const categories = [];
		const categoryRecords = {};
		const categoryTypes = new Map();
		const gr = new GlideRecord(FileTaxonomyCategoryMap.TABLE);
		gr.orderBy('category');
		gr.query();
		while (gr.next()) {
			const category = gr.category.getRefRecord();
			if (!UDCUtil.isValidGlideRecord(category)) continue;

			const categorySysId = category.getUniqueValue();
			if (categoryTypes.has(categorySysId))
				categoryTypes.get(categorySysId).push(gr.getValue('taxonomy_type'));
			else {
				categoryRecords[categorySysId] = {
					id: categorySysId,
					label: category.getDisplayValue('label') || null,
					icon: category.getDisplayValue('icon') || UDCConstants.fallbackIcons.CATEGORY,
					categories: null, //TODO: create script to fetch child
				};
				categoryTypes.set(categorySysId, [gr.getValue('taxonomy_type')]);
			}
		}
		for (const key in categoryRecords) {
			categoryRecords[key].types = categoryTypes.get(key);
			categories.push(categoryRecords[key]);
		}
		return categories;
	}

	/**
	 * Retrieves all Types with category details
	 * @returns {Map} with key typeSysId and value array of categories
	 */
	static getCatagoriesForType() {
		const typeCategories = new Map();
		const gr = new GlideRecord(FileTaxonomyCategoryMap.TABLE);
		gr.query();
		while (gr.next()) {
			const category = gr.category.getRefRecord();
			if (!UDCUtil.isValidGlideRecord(category)) continue;

			const categorySysId = category.getUniqueValue();
			const typeSysId = gr.getValue('taxonomy_type');

			const categoryDetail = {
				sysId: categorySysId,
				label: category.getDisplayValue('label'),
				description: category.getDisplayValue('description'),
				icon: category.getDisplayValue('icon') || UDCConstants.fallbackIcons.CATEGORY,
			};
			if (typeCategories.has(typeSysId)) {
				const categories = typeCategories.get(typeSysId);
				const isCategoryExist = categories.some(element => element.sysId === categorySysId);
				if (!isCategoryExist) typeCategories.get(typeSysId).push(categoryDetail);
			} else typeCategories.set(typeSysId, [categoryDetail]);
		}
		return typeCategories;
	}

	/**
	 * Checks if a taxonomy category is mapped for a given type.
	 *
	 * @param {string} typeSysId - The sys id of the type.
	 * @returns {boolean} - True if a taxonomy type is mapped to a category, false otherwise.
	 */
	static hasMappedTaxonomyCategory(typeSysId) {
		const gr = new GlideRecordSecure(FileTaxonomyCategoryMap.TABLE);
		gr.addQuery(FileTaxonomyCategoryMap.Column.TaxonomyType, typeSysId);
		gr.setLimit(1);
		gr.query();
		return gr.hasNext();
	}
}
