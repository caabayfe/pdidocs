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
    var fields = api.context.props.fields;
    var layout = api.context.props.layout;
    var sections = [];
    if (layout != null) {
        for (var section = 0; section < layout.length; section++) {
            var firstColumFields=[], firstColumFieldsData = [],
                secondColumFields = [],
                secondColumFieldsData = [];
            firstColumFields = layout[section][0].fields;
            var singleColumn=true;

            if (layout[section][1] != null){
                singleColumn=false;
                 secondColumFields = layout[section][1].fields;
            }

            for (var j = 0; j < fields.length; j++) {
                if (firstColumFields.includes(fields[j].name))
                    firstColumFieldsData.push(fields[j]);

                if (secondColumFields != null && secondColumFields.includes(fields[j].name))
                    secondColumFieldsData.push(fields[j]);
            }

            var fieldsMap = {
                'singleColumn':singleColumn,
                'firstColumnData': firstColumFieldsData
            };

            if (secondColumFields != null)
                fieldsMap.secondColumnData = secondColumFieldsData;
                
            sections.push(fieldsMap);
        }
    }
    api.setState('sections', sections);

}
