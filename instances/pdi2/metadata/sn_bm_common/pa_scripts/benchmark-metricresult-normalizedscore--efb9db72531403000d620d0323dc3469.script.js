function isValidNumber(inp) {
    if (!inp || gs.nil(inp) || isNaN(inp) || !isFinite(inp) || inp == 0)
        return false;
    else
        return true;
}

var normalizedScore = function(metric, normalizedValue) {

    normalizedValue = Number(normalizedValue);
    if (!isValidNumber(normalizedValue)) return 0;

    var categoryGA = new GlideAggregate('asmt_metric_category');
    categoryGA.addAggregate('SUM', 'weight');
    categoryGA.addQuery('metric_type', metric.category.metric_type);
    categoryGA.setGroup(false);
    categoryGA.query();
    var totalWeight = (categoryGA.next()) ? Number(categoryGA.getAggregate('SUM', 'weight')) : 1;
    if (!isValidNumber(totalWeight))
        totalWeight = 1;

    var weight = gs.nil(metric.category) ? 1 : Number(metric.category.weight);
    if (!isValidNumber(weight))
        return 0;

    var asmtScale = (gs.nil(metric.category) || gs.nil(metric.category.metric_type)) ? 10 : Number(metric.category.metric_type.scale_factor);
    if (!isValidNumber(asmtScale))
        return 0;

    var bmScale = 10;
    return (normalizedValue > 0) ? (normalizedValue * (weight / totalWeight)) / asmtScale * bmScale : 0;
};

normalizedScore(current.metric, current.normalized_value);
