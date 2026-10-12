new GlideTSUtil().migrateToTSConfiguration(table);
gs.addInfoMessage(gs.getMessage("Migration to Text Index Configuration is completed"));
var urlOnStack = GlideSession.get().getStack().bottom();
response.sendRedirect(urlOnStack);
