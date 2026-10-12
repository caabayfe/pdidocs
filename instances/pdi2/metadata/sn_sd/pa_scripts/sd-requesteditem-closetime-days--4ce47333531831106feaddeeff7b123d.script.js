var diff = function(x, y) {
    return y.dateNumericValue() - x.dateNumericValue();
};
var days = function(x, y) {
    return diff(x, y) / (24 * 60 * 60 * 1000);
};
days(current.opened_at, current.closed_at);
