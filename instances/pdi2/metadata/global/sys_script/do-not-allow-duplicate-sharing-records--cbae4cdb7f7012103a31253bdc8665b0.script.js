
            
            (function executeRule(current, previous /*null when async*/ ) {

                // Validate that a sharing record does not already exist for global sharing,
                // the specified user or group.

                var sharingGR = new GlideRecord("sys_app_template_sharing_criteria_m2m");
                sharingGR.addQuery("template", current.template);
                sharingGR.addQuery("user_criteria", current.user_criteria);
                sharingGR.setLimit(1);
                sharingGR.query();

                if (sharingGR.hasNext()) {
                    // Duplicate record exists, abort the insert.
                    current.setAbortAction(true);
                    gs.addErrorMessage(gs.getMessage("Duplicate sharing record already exists for the specified user criteria and template."));
                }

            })(current, previous);
