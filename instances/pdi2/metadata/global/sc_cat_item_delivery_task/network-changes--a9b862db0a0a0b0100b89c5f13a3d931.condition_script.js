answer=runMe();

function runMe() {
  var gr = new GlideRecord('change_request_imac');
  gr.get(current.change_request);
  return (gr.network_component +'' == 'true');
}
