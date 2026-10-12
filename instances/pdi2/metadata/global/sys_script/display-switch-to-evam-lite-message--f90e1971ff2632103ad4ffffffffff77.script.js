(function executeRule(current, previous /*null when async*/ ) {

    if (gs.getProperty("glide.search.evam.use_legacy_template_generation") === "true") {

        gs.addInfoMessage(gs.getMessage("To improve response time, consider switching to the new logic for search result template generation by setting the system property 'glide.search.evam.use_legacy_template_generation' to false."));

    }

})(current, previous);
