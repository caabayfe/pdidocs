// Used fields: current.is_scheduled
var isScheduleReport = function (is_scheduled)
{
    var res = 0; // No
    if(is_scheduled)
    {
        res = 1; // Yes
    }
    return res;
};
isScheduleReport(current.is_scheduled);
