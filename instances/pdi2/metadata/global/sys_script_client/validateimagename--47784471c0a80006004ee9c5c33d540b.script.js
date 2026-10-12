function onSubmit() {
   var valid = ['.gif', '.png', '.jpg', '.jpeg', '.bmp', '.ico', '.svg'];
   var n = g_form.getValue('name');
   if (isValidImageName(n, valid))
      return;

   alert(new GwtMessage().getMessage('Image name must end with one of the following: {0}', valid.join(', ')));
   g_form.flash('db_image.name', "#FFFACD", 0);
   return false;
}

function isValidImageName(name, valid) {
   if (!name)
      return false;

   for (var i = 0; i < valid.length; i++) {
      if (name.endsWith(valid[i]))
         return true;
   }
   return false;
}
