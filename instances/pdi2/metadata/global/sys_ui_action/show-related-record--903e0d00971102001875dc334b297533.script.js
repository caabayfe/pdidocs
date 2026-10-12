
      
            var returnUrl = current;
            var url = action.getValues().get('sysparm_referring_url');
            if (url)
                returnUrl = url;
            var file = new GlideRecord("sys_metadata");
            file.addQuery("sys_update_name", current.file_name.toString());
            file.query();
            if (!file.next()) {
                gs.addInfoMessage(gs.getMessage("No record exists for this upgrade detail"));
                action.setRedirectURL(current);
            } else {
                var relatedRecord = new GlideRecord(file.sys_class_name);
                relatedRecord.get(file.sys_id);
                action.setRedirectURL(relatedRecord);
                action.setReturnURL(returnUrl);
            }
