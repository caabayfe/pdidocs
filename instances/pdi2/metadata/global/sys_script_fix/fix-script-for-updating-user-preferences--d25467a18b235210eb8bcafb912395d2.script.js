(function updateUserPreferencePropertyName() {
    var gr = new GlideRecord('sys_user_preference');

    gr.addQuery('name', 'STARTSWITH', 'glide.mobile.polaris.theme.variant');  
    gr.query();

    while (gr.next()) {
        var originalName = gr.name;  
        gr.setValue('name', originalName.replace('glide.mobile.polaris.theme.variant', 'glide.mobile.theme.variant'));  

        gr.update();  
    }
})(); 
