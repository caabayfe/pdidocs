var variable = current.expert_variable.getDisplayValue().split("IO:")[1];
gs.print(variable);
var option = new GlideRecord("expert_variable");
if (option.get(variable)) {gs.print("FOUND ONE");
  current.variable = (option.name.nil()) ? option.question_text : option.name;
}
