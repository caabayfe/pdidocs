function include({ imports }) {

		const updateCategoriesInfoMap = (categoriesTree, categoriesInfoMap = {}) => {
			function processCategoryItem(item) {
				// Filter out categories that are already present in categoriesInfoMap as they dont need to be updated
				if (!categoriesInfoMap[item.id]) {
					const itemData = {
						id: item.id,
						label: item.label,
						catalog: item.catalog,
						level: item.level,
						path: item.path,
						position: item.position
					};
					categoriesInfoMap[item.id] = itemData;
				}
				if (item.children && item.children.length > 0) {
					item.children.forEach(child => {
						processCategoryItem(child);
					});
				}
			}

			categoriesTree.forEach(item => {
				processCategoryItem(item);
			});
		return categoriesInfoMap;
	};


	const findCategoryById = (dataArray, categoryId) => {
		for (let i = 0; i < dataArray.length; i++) {
			const item = dataArray[i];
			if (item.id === categoryId) {
				return item;
			}
			if (item.children?.length) {
				const found = findCategoryById(item.children, categoryId);
				if (found) {
					return found;
				}
			}
		}
		return null;
	}

	return {
		updateCategoriesInfoMap,
		findCategoryById
	};
}
