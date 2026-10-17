var diff=function(x,y){return y.dateNumericValue() - x.dateNumericValue();};
var days=function(x,y){return diff(x,y)/(24*60*60*1000);};
days(current.work_start, current.work_end);
