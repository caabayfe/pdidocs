var createdOn = new GlideDateTime(current.getValue("sys_created_on"));
var currentDate = new GlideDateTime();
var grProp = gs.getProperty("glide.email.smtp.claim.lookback.hrs");
var lookbackHours = ((grProp == null) || (grProp == 0)) ? 24 : grProp;
var diff = GlideDateTime.subtract(createdOn, currentDate).getNumericValue() / 3600000;
if (currentDate.compareTo(createdOn) == 1 && diff > Math.abs(lookbackHours)) {
    gs.addInfoMessage(gs.getMessage("To resend, update the glide.email.smtp.claim.lookback.hrs property with the number of hours (the property value should be greater than the difference of current date and the date of email creation)."));
    gs.setRedirect('/sys_email.do?sys_id='+current.sys_id);
} else {
    current.mailbox = "outbox";
    current.type = "send-ready";
    current.update();
}
