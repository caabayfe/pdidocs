try {
     var startTime = new GlideDateTime();
     gs.info("Start: Scheduler job for fetching authenticator metadata. " + startTime);
     SNC.GlideWebAuthnMetadata.fetchMetadata();
     var endTime = new GlideDateTime();
     gs.info("End: Scheduler job for fetching authenticator metadata. " + endTime);
     gs.info("Time Taken by webAuthn scheduler job: " + gs.dateDiff(startTime, endTime, true));
} catch(e) {
     gs.error("Error in fetching authenticator metadata");
     gs.eventQueue("webauthn.import.metadata.failed", null, gs.getUserName());
}
