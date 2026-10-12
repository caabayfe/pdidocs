var begin = current.begin;
var end = current.end;
var gdtBegin = new GlideDateTime(begin);
var gdtEnd = new GlideDateTime(end);
var duration = current.duration.getDisplayValue();

//If the begin and end times are present, calculate the duration
if (begin && end) {
    var difference = GlideDateTime.subtract(gdtBegin, gdtEnd);
    current.duration.setValue(difference);
}

//If either begin or end do not have a value, set duration to null
if ((!begin || !end) && duration)
    current.duration.setValue(null);
