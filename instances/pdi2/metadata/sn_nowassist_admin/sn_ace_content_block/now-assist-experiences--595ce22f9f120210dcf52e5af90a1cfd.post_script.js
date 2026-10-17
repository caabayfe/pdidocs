(function(context, pageParams) {
    try {
        context.props_details.telemetryData = {
            event_name: "Now Assist Experiences clicked",
            title: "Now Assist Experiences",
            append_to_payload: {}
        };
          context.label = sn_i18n.Message.getMessage("sn_nowassist_admin", "Now Assist Experiences");
    } catch (e) {
        gs.error("Unable to load Now Assist Experiences in Now assist admin"+JSON.stringify(e));
    }
})(context, pageParams);
