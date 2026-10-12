function onLoad() {
   // make client scripts happy
}

function calcReturn0(response, args) {
   var answer = response.responseXML.documentElement.getAttribute("answer");
   var array = new Array();
   array.push(args);
   calcReturn(answer, response, array);
}

function calcReturn(answer, response, args) {
   var controlName = args[0];
   var myControl = g_form.getControl(controlName);
   var label = "nolabel";
   var value = answer
   if (answer && answer.indexOf("|") > -1) {
      var parts = answer.split("|");
      value = parts[0];
      label = parts[1];
   }
   g_form.setValue(controlName, value, label);
}
