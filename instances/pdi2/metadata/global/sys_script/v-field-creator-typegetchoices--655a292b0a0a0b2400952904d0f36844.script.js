/**
 * Return the list of valid choices for field lengths
 */
function v_field_editor_typeGetChoices() {
  limitFieldType();
}

function limitFieldType() {
  var ctype = "string";
  if (current != null) {
    ctype = current.type;
  }

  addChoiceType(ctype); // add myself

  if (ctype == "string") {
    addChoiceType("reference");
    addChoiceType("choice");
    addChoiceType("url");
    addChoiceType("journal");
    addChoiceType("suggestion");
  }

  if (ctype == "reference") {
    addChoiceType("string");
  }

  if (ctype == "choice") {
    addChoiceType("string");
  }

  if (ctype == "url") {
    addChoiceType("string");
  }

  if (ctype == "suggestion") {
    addChoiceType("string");
  }
}

function addChoiceType(type) {
  var choicesGR = new GlideRecord("sys_choice");
  choicesGR.addQuery("name", "v_field_creator");
  choicesGR.addQuery("element", "type");
  if (type != "")
    choicesGR.addQuery("value", type);

  choicesGR.addQuery("language", gs.getSession().getLanguage());
  choicesGR.query();
  while(choicesGR.next()) {
    answer.add(choicesGR.value, choicesGR.label);
  }
}
