current.ftr_data = hdrftr_calculateFtrData();

function hdrftr_calculateFtrData() {
    return hdrftr_translateFtrCellValue(current.left_ftr_content) + ', ' + hdrftr_translateFtrCellValue(current.mid_ftr_content) + ', ' + hdrftr_translateFtrCellValue(current.right_ftr_content);
}

function hdrftr_translateFtrCellValue( dataType) {
    if (dataType == 0) 
        return gs.getMessage('Page X');
    else if (dataType == 1) 
        return gs.getMessage('Page X of Y');
    else if (dataType == 2) 
        return gs.getMessage('Report Title');
    else if (dataType == 3) 
        return gs.getMessage('Run By');
    else if (dataType == 4) 
        return gs.getMessage('Run Date and Time');
    else if (dataType == 5) 
        return gs.getMessage('User Specified Text');
    else if (dataType == 6) 
        return gs.getMessage('Image');
    else  
        return gs.getMessage('Empty');
}
