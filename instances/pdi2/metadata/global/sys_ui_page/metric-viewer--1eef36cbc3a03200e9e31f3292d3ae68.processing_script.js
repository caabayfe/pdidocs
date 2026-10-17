var my_target = 'metric_viewer.do?sysparm_table=' + table + '&sysparm_sys_id=' + sysID + '&sysparm_metric=' + metric + '&sysparm_time_span=' + timeSpanPicker +'&sysparm_query=' + query +'&sysparm_transform=' + transformPicker + '&sysparm_transform_value=' + complexInput;

response.sendRedirect(my_target);
