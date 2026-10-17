var integrationsLaunchpadImageHandler = Class.create();
integrationsLaunchpadImageHandler.prototype = {
    initialize: function() {
        this.prefix = 'SOW_LP_CC_';
    },

    createImage: function(){
        var gr = new GlideRecord('db_image');
        gr.newRecord();
        gr.name = this.prefix + new Date().getTime() + '.jpg';
        var sysId = gr.insert();
        
        return sysId 
            ? {success: true, data: {sys_id: sysId}}
            : {success: false, error: {message: gs.getMessage('Insert failed')}};
    },
    
    updateImage: function(image, record_sys_id, imageParams){       
        var gr = new GlideRecord('db_image');
        if(!gr.get(record_sys_id))
            return {success: false, error: {message: gs.getMessage('cannot find sysId of updated image')}};
        if (!gr.name.startsWith(this.prefix))
            return {success: false, error: {message: gs.getMessage('Update failed - image found is not under launchpad custom connector images')}};
        gr.image = image;
        var fileNameArr = imageParams.file_name ? imageParams.file_name.split('.') : ['jpg'];
        var fileType = fileNameArr[fileNameArr.length-1] || ['jpg'];
        gr.name = this.prefix + new Date().getTime() + '.' + fileType;
        var sysId = gr.update();
        return sysId 
            ? {success: true, data: {sys_id: sysId}}
            : {success: false, error: {message: gs.getMessage('Update failed')}};
    },

    type: 'integrationsLaunchpadImageHandler'
};
