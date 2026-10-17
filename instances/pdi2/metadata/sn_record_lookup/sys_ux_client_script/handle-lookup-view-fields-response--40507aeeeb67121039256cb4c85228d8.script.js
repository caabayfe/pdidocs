/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const response = api?.data?.get_record_lookup_view_fields?.output?.data?.GlideLayout_Query || [];
    const {
        searchViewFields, selectedViewFields
    } = response;

    if(Array.isArray(response))
        return;

    const getFieldList = (sectionLayout) => {
        let sectionRowList = sectionLayout.reduce((sectionList, sectionItem) => {
            let sectionRows = sectionItem.rows.reduce((rowList, rowItem) => {
                return [...rowList, ...rowItem];
            }, []);
            return [...sectionList, ...sectionRows];
        }, []);

        let fieldList = sectionRowList.reduce((acc, curr) => {
            return [...acc, ...curr.fields];
        }, []);

        return fieldList.join(',');
    };

    const viewFields = {
        searchViewFields: !searchViewFields?.sectionLayout ?  '' : getFieldList(searchViewFields.sectionLayout),
        selectedViewFields: !selectedViewFields?.sectionLayout ? '' : getFieldList(selectedViewFields.sectionLayout)
    };
    api.setState('viewFields', viewFields);
}
