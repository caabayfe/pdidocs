var diff = function(x,y) {
	return y.dateNumericValue() - x.dateNumericValue();
};
var hours = function(x,y) {
	return diff(x,y)/(60*60*1000);
};

hours(current.ea_sys_created_on, current.ea_sys_updated_on);
