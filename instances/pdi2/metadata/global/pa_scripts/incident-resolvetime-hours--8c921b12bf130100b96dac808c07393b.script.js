var diff=function(x,y){return y.dateNumericValue() - x.dateNumericValue();};
var hours=function(x,y){return diff(x,y)/(60*60*1000);};
hours(current.opened_at, current.resolved_at);
