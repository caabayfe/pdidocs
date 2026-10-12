current.instance_id = "source_instance";
if (gs.nil(current.instance_name))
  current.instance_name = "Source Instance";
if (gs.nil(current.instance_url))
  current.instance_url = gs.getProperty("glide.servlet.uri") + "";

if (current.isNewRecord())
  checkForDuplicates();

function checkForDuplicates() {
  var gr = new GlideRecord("instance");
  gr.addQuery("source", true);
  gr.addQuery("primary", true);
  gr.query();
  if (gr.next()) {
    gs.addErrorMessage('Duplicate record: primary source already exists.');
    current.setAbortAction(true);  
  }
}
