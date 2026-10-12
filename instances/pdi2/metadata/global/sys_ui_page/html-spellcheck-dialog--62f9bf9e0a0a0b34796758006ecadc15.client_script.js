startupSpellCheck();

function startupSpellCheck() {
   var gdw = GlideDialogWindow.get();
   initDocument();
}

function closeDialog() {
   GlideDialogWindow.get().destroy();
}
