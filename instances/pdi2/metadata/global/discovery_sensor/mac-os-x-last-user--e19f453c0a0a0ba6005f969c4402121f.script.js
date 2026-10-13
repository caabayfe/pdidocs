new DiscoverySensor({
    process: function(result) {
        if (gs.nil(result.output))
            return;

        this.parseOutput(result.output);
    },

    parseOutput: function(output) {
        var lines = output.split("\n");
        for (var i=0; i<lines.length; i++) {
            if (lines[i].search("console") == -1)
                continue;

            var userName = lines[i].split(" ")[0];
            this.updateLastUser(userName);
            break;
        }
    },

    updateLastUser: function(userName) {
        var nameField = gs.getProperty('glide.discovery.assigned_user_match_field', "user_name");
        current.assigned_to = GlideUser.getSysId(nameField, userName);
    },

    type: "DiscoverySensor"
});
