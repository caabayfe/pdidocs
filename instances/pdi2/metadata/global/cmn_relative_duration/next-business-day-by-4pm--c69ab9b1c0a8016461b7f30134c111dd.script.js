// Next business day by 4pm if before 10am
var days = 1;
// If the current time is after 10:00, add another day
if (calculator.isAfter(calculator.startDateTime, "10:00:00")) {
   days++;
}

calculator.calcRelativeDueDate(calculator.startDateTime, days, "16:00:00");   
