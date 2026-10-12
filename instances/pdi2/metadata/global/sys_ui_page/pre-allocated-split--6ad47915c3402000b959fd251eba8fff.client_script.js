function actionOK() {
   
   var total_quantity = gel("quantity").value;
   var split_quantity = trim(gel("split_quantity").value);

   if(split_quantity == "") {
      alert(getMessage("Please provide the quantity to split"));
      return false;
   }
   else {

      var split = parseInt(split_quantity, 10)
      var total = parseInt(total_quantity, 10);
      var regNumber = new RegExp("^[0-9]+$");
   
      if(!regNumber.test(split)) {
         alert(getMessage("Split quantity should be a positive whole number"));
         return false;
      }
      else if(split >= total) {
         alert(getMessage("Split quantity cannot be greater or equal to the total quantity"));
         return false;
      } 
      else if(split == 0) {
         alert(getMessage("At least 1 should be split"));
         return false;
      } 
   }
   
   return true;
}

function cancel() {
   var c = gel('cancelled');
   c.value = "true";
   GlideDialogWindow.get().destroy();
   return false;
}
