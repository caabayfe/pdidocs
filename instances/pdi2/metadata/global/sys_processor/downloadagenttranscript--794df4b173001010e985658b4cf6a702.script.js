(function process(g_request, g_response, g_processor) {
	try {
		var cookies = g_request.getHeader('Cookie');

		var splitCookie = cookies.split('guest_session_identifier=');

		if (splitCookie.length > 1) {
			// split out just the ID
			var guestIdWithMore = splitCookie[splitCookie.length - 1].split(';');
			
			var foundGuestID = guestIdWithMore[0];
		}

		// set the header so the file is downloaded instead of opened...
		var sys_id = g_request.getParameter("sysparm_sys_id").toString();

		if (sys_id) {
			var hasAccess = sn_cs.VASystemObject.userCanAccessConversation(sys_id + "", foundGuestID + "");

			if (hasAccess) {
				var transcript = sn_cs.VASystemObject.getTranscriptById(sys_id);
				if (transcript && transcript.length > 0) {
					g_response.setHeader("Content-Disposition", 'attachment; filename="transcript_' + sys_id + '.txt"');
					g_processor.writeOutput("text/plain", transcript); 
				}
				else {
					g_processor.writeOutput("text/plain", gs.getMessage("No transcript found!")); 

				}
			} else {
				g_processor.writeOutput("text/plain", gs.getMessage("This user does not have access to this transcript.")); 
			}
		}
		else {
			g_processor.writeOutput("text/plain", gs.getMessage("No sys id provided!"));

		}
	}
	catch (e) {
		var logger = new GlideChatbotLoggerSetupUtil("com.glide.cs").setup(sys_id); 
		logger.info("Transcript for Conversation Sys ID {0} cannot be accessed.", JSON.stringify(sys_id)); 
		g_processor.writeOutput("text/plain", gs.getMessage("This transcript cannot be accessed."));

	}
	
})(g_request, g_response, g_processor);
