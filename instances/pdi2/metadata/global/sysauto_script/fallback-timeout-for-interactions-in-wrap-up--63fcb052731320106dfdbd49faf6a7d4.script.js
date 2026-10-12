// Periodically check for interactions in wrap up state and close them if timed out for
// maximum WRAP UP duration. Deafult value is 15 mins.
var maxWrapupDuration = gs.getProperty("com.glide.interaction.max_wrapup_duration", 15);
new global.WrapUpInteractionUtil().closeStaleInteractions(maxWrapupDuration);
