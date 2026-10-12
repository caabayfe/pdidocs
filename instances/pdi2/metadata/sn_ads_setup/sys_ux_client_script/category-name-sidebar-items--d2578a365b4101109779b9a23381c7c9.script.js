/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.imports
 */
function evaluateProperty({
    api
}) {
    let isNewCategory = api.context.props.categoryId === '-1' ? true : false;
    if(isNewCategory) {
        return [{
            "id": '-1',
            "label": 'New Category'
        }];
    }
    
    const category = api.data.get_setup_category_rest.output;
    if (category && category.result) {
        return [{
            "id": category.result.sys_id ? category.result.sys_id : '',
            "label": category.result.name ? category.result.name : '',
            "icon": category.result.name && (category.result.description || category.result.rich_description) ? 'check-outline': 'none'
        }];
    }
    return [];
}
