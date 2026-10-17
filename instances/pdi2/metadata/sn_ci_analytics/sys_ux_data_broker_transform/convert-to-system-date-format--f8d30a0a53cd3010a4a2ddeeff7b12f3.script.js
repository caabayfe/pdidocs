function transform(input) {
    var resultData = input.data || {};
    var FormattedDates = {};
    var gd = new GlideDate();
    var keys = Object.keys(resultData);
    keys.forEach(function(key) {
        gd.setValue(resultData[key]);
        FormattedDates[key] = gd.getDisplayValue();
    });
    return FormattedDates;
}
