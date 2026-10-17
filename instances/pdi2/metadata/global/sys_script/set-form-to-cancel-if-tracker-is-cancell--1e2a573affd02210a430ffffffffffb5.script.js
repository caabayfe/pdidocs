(function executeRule(current, previous /*null when async*/ ) {

        var resultGr = new GlideRecord("scan_result");
        resultGr.addQuery("state", "in_progress");
        resultGr.setWorkflow(false); // Prevent recursion
        resultGr.query();

        while (resultGr.next()) {
            var progress_id = resultGr.getValue("progress_id");

            var trackerGr = new GlideRecord("sys_execution_tracker");
            if (trackerGr.get(progress_id)) {
                var state = trackerGr.getValue("state");

                if (state == "4") { // update for cancelled state
                    resultGr.setValue("state", "cancelled");
                    resultGr.setWorkflow(false); // Prevent business rules on update
                    resultGr.update();
                }
            }
        }

    })(current, previous);
