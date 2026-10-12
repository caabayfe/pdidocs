validateSpan();

function validateSpan() {

    if (current.start_time1.nil()) 
       abortSpan('Span start must be specified', current.start_time1);

    if (current.end_time1.nil()) 
       abortSpan('Span end must be specified', current.end_time1);

    var start = current.start_time1.getGlideObject();
    var end = current.end_time1.getGlideObject();

    if (start.getNumericValue() >= end.getNumericValue())
       abortSpan('Span must end after it starts', current.end_time1);


    var cal = new Packages.java.util.GregorianCalendar();
    cal.setTimeZone(start.getUserTimeZone());

    cal.setTime(start.getRaw());

    var startDay = cal.get(6);
    if (startDay != 1)
       abortSpan('Span must start after 00:00:00 and before 24:00:00', current.start_time1);

    cal.setTime(end.getRaw());
    var endDay = cal.get(6);
    if (endDay != 1)
       abortSpan('Span must end after 00:00:00 and before 24:00:00', current.end_time1);

}

function abortSpan(error, element) {
    current.setAbortAction(true); 
    element.setError(error);
}
