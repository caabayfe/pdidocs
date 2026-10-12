(function executeRule(current, previous /*null when async*/ ) {

    /*  usecase: initally we can select aggregate/separate (timeseries)  then we can change the widget type to invalid combination
     *	that time we have to reset it properly.
     */
    var config = JSON.stringify({
        "indicator_sysid": current.getValue('indicator'),
        "widget_type": current.getValue('type'),
        "is_previous_period_chart": current.getValue('is_compare_chart'),
        "indicator_group": current.getValue('tag'),
		"followed_breakdown_relation": current.getValue('followed_breakdown_relation')
    });
    var result = SNC.PAMultiElementUtil.getOptionsForMultipleElements(config);

    //in case show all is selected but multiple_elements_view is not AG or SP then set it to SP
    if (current.follow_element == false) {
        current.multiple_elements_view = "";
    } else if (result == "show_all" && current.multiple_elements_view == "") {
        current.multiple_elements_view = "separate"; // we can set default value to separate
    } else if (result === "not_supported" && current.multiple_elements_view != "") {
        current.multiple_elements_view = "";
    }

})(current, previous);
