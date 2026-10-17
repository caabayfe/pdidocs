/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    var setting = api.context.app.sessionTabTitle;
    if (!setting)
        return;
    
    var titleFields = setting.split(',');
    const recordValues = event.payload.data.GlideViewQuery_Query.uiView.glideLayoutItem._query.GlideLayout_Query.formLayout.recordValues;
    var title, number;
    var first = titleFields.length;
    
    recordValues.forEach(field => {
        var index = titleFields.indexOf(field.name);
        if (field.name == 'number') 
            number = field.displayValue;
        
        if (index > -1 && index < first && field.displayValue != null && field.displayValue != '') {
            title = field.displayValue;
            first = index;
        }
    });
    
    if (!title || title == '') 
        title = number;
    helpers.screen.updateStatus({
        title: title
    });
    api.setState('tabTitleText', title);
}
