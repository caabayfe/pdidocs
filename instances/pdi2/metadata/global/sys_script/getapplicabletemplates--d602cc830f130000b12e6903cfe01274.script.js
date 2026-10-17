function getApplicableTemplates(table) {
   var answer = "";
   var tu = new TemplateUtil();
   var gr = tu.getApplicable(table);
   while (gr.nextRecord())
      answer += gr.sys_id + ",";

   return answer;
}
