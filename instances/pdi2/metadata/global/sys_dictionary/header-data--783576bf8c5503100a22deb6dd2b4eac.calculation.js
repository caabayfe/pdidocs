current.hdr_data = hdrftr_calculateHdrData();

function hdrftr_calculateHdrData() {
    return hdrftr_translateHdrCellValue(current.left_hdr_content) + ', ' + hdrftr_translateHdrCellValue(current.mid_hdr_content) + ', ' + hdrftr_translateHdrCellValue(current.right_hdr_content);
}

function hdrftr_translateHdrCellValue( dataType) {
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
