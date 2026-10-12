function ok (){
    var handler = window.GlideModal ? GlideModal.get().getPreference('sysparm_handler'): GlideDialogWindow.get().getPreference('sysparm_handler');
    if(!handler){
        return false;
    }
    GlideModal.get().destroy();
    return handler();
}

function cancel(){
    GlideModal.get().destroy();
    return false;
}
