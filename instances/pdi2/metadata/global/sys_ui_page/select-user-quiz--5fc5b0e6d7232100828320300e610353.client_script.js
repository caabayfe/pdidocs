function impOk() {
   var is_ok = false;
   var quiz_taker = gel('quiz_taker');
   
   if (quiz_taker.value != '')
      is_ok = true;
   
   if (!is_ok) {
      alert('Please select a user to assess this record');
      return false;
   }

   var form = document.forms['form.' + '${sys_id}'];
   gel('poll_img').style.display = 'block';
}


function clearSelect() {
   var sel = gel('quiz_taker');
   for (var i =0; i<sel.options.length; i++)
       sel.options[i].selected = false;
}
