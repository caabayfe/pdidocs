
        // create the URL for the ui_page to display the log data
        var maxRows = 2000;
        var time = new GlideDateTime(current.sys_created_on);
        var diff = current.response_time;
        var url = "ui_page_process.do?name=log_file_browser";
        url += "&end_time=" + time.getDisplayValue();
        time.subtract(diff+5000);
        url += "&start_time=" + time.getDisplayValue();
        url += "&max_rows=" + maxRows;
        url += "&filter_session=" + current.session;
        gs.setRedirect(url);
    
