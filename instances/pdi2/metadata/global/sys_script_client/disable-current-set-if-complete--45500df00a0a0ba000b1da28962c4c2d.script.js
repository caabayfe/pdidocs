function onLoad() {
   if (g_form.getValue('state') != "complete")
      return;

   var e = $('ni.tr.java.com.glide.update.UpdateSetFormatterAction[current_set]');
   if (e)
      e.style.display = 'none';
}
