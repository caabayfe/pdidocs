var locations = [];
var location = current.location;
while (location) {
  if (locations.indexOf(location) !== -1)
    break;

  locations.push(location);
  var gr = new GlideRecord('cmn_location');
  gr.get(location);
  location = gr.getValue('parent');
}
locations;
