var choiceValues = new GlideRecord("sys_choice");
choiceValues.addQuery("value", "credentials");
choiceValues.addQuery("name", "sys_sg_button");
choiceValues.addQuery("element", "preconditions");
choiceValues.addQuery("language", "en");
choiceValues.query();
while(choiceValues.next()) {
  choiceValues.label = "HR Task Credentials";
  choiceValues.setWorkflow(false);
  choiceValues.update();
}

choiceValues = new GlideRecord("sys_choice");
choiceValues.addQuery("value", "signature");
choiceValues.addQuery("name", "sys_sg_button");
choiceValues.addQuery("element", "preconditions");
choiceValues.addQuery("language", "en");
choiceValues.query();
while(choiceValues.next()) {
  choiceValues.label = "HR Task Signature";
  choiceValues.setWorkflow(false);
  choiceValues.update();
}
