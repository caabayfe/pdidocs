// Return an array of sys_ids of the users that have at least one role
        // optional parameters allow the exclusion (NOT IN) of some roles or
        // look for specific roles (IN)
        //
        // optional: queryCondition - 'IN' or 'NOT IN'
        // optional: roleList - a comma separated list of role names
        //
        function getRoledUsers(queryCondition, roleList) {
           var roleListIds;
           if (queryCondition && roleList) {
              roleListIds = getRoleListIds(roleList);
           }

           var ids = [];
           var prevID = '';
           var gr = new GlideRecord('sys_user_has_role');
           if (roleListIds) {
              gr.addQuery('role', queryCondition, roleListIds);
           }

            // property set to -1 - means there's no limit
            // property without valid value or not existed - means apply default limit 10M
            var limit = gs.getProperty('glide.security.get_roled_users.limit');
            if (limit > 0) {
                gr.setLimit(limit);
            } else if (limit != -1) {
                gr.setLimit(10000000);
            }

           gr.query();
           while (gr.next()) {
              var id = gr.user.toString();
              if (id != prevID) {
                ids.push(id);
                prevID = id;
              }
           }
           return ids;
        }

        // get sys_id's for the named roles
        function getRoleListIds(roleList) {
           var ids = [];
           var gr = new GlideRecord('sys_user_role');
           gr.addQuery('name','IN',roleList);
           gr.query();
           while (gr.next()) {
              ids.push(gr.sys_id.toString());
           }
           return ids;
        }
        
