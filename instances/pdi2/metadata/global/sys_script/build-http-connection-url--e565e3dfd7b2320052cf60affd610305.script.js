(function executeRule(current, previous /*null when async*/ ) {
        var urlString = "";
        var protocol = "";
        var portString = "";

        if (current.mutual_auth && !current.use_mid && !current.protocol_profile.nil())
            protocol = current.protocol_profile.getDisplayValue();
        else if (current.mutual_auth && current.use_mid && !current.mid_protocol_profile.nil())
            protocol = current.mid_protocol_profile.getDisplayValue();
        else
            protocol = current.protocol;

        if (!current.port.nil())
            portString = ":" + current.port;
  
        if (protocol != "")
            urlString = protocol + "://" + current.host + portString + current.base_path;

        current.connection_url = urlString;

})(current, previous);
