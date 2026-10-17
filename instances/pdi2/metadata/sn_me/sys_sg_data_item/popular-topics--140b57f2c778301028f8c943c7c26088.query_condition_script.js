(function getQueryString(input) {
    var ids = (new sn_ex_sp.PopularTopicsUtil()).getPopularTopicSysIds();
    return "sys_idIN" + ids.join(",");
})(input);
