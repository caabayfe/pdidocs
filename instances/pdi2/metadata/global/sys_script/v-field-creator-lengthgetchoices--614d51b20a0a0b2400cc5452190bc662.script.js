/**
 * Return the list of valid choices for field lengths
 */
function v_ws_field_editor_lengthGetChoices() {
  limitFieldLength();
}

function v_field_editor_lengthGetChoices() {
  limitFieldLength();
}

function limitFieldLength() {
  var length = "40";
  if (typeof current !== "undefined" && current != null) {
		var current_length = current.length.toString();
		length = GlideStringUtil.notNil(current_length) ? current_length : length;
	}
  var l = Packages.java.lang.Integer.parseInt(length);
  var choicesGR = new GlideRecord("sys_choice");
  choicesGR.addQuery("name", "v_field_creator");
  choicesGR.addQuery("element", "length");
  choicesGR.addQuery("language", gs.getSession().getLanguage());
  choicesGR.query();
  while(choicesGR.next()) {
    var v = Packages.java.lang.Integer.parseInt(choicesGR.value.toString());

    if (v < l)
      continue;

    answer.add(choicesGR.value, choicesGR.label);
  }
}
