var reportSourceType = function (reportSource)
{
    var type = -1; // unknown
    if(!gs.nil(reportSource))
    {
        type = 2;
    } else {
        type = 1;
    }
    return type;
};
reportSourceType(current.report_source);
