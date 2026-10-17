/* The style field must contain ${body} to work correctly so we'll make sure this is the case to minimize confusion */
/* as to why emails are being sent with styles but without content. */
if (current.style.indexOf("${body}") < 0) {
   gs.addErrorMessage(gs.getMessage("The style must contain ${body} where the body of the email should appear"));
   current.setAbortAction(true);
}
