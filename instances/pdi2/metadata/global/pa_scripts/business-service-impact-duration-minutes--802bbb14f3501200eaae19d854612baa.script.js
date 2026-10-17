var diff=function(x,y){return y.dateNumericValue() - x.dateNumericValue();};
var minutes=function(x,y){return diff(x,y)/(60*1000);};
var allDay=function(){ return 60*24;};
var isToday =function(x){
	var gdt = new GlideDateTime(x);
	var today = new GlideDateTime();
	today.setNumericValue(score_start.dateNumericValue());	
	return gdt.getDate().getValue() == today.getDate().getValue();
};

if(isToday(current.vt_start) && isToday(current.vt_end)){
	minutes(current.vt_start, current.vt_end);
}else if(isToday(current.vt_start)){
	minutes(current.vt_start, score_end);
}else if(isToday(current.vt_end)){
	minutes(score_start, current.vt_end);
}else{
	allDay();
}
