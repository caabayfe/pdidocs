function transform(input) { 
    var empty = '', 
		table = input.table || empty, 
		sysId = input.sysId || empty, 
		trueTable = empty, 
		trueTitle = empty, 
		gr = undefined; 
 
    if (!gs.nil(table) && !gs.nil(sysId)) { 
        gr = new GlideRecordSecure(table); 
        if (gr.get(sysId)) { 
            trueTable = gr.getRecordClassName(); 
            trueTitle = gr.getDisplayValue(); 
        } 
    } 
 
    return { 
        table: trueTable, 
        sysId: sysId, 
        title: trueTitle
    }; 
} 
