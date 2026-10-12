// foreach cell in the template, if the previous content is user defined text or image and the current content is not,
// clear out the user text, image fields.
 
pdf_page_hdrftr_cleanupUsrTxtImg('left_hdr_content', 'left_hdr_text', 'left_hdr_img');
pdf_page_hdrftr_cleanupUsrTxtImg('mid_hdr_content', 'mid_hdr_text', 'mid_hdr_img');
pdf_page_hdrftr_cleanupUsrTxtImg('right_hdr_content', 'right_hdr_text', 'right_hdr_img');
pdf_page_hdrftr_cleanupUsrTxtImg('left_ftr_content', 'left_ftr_text', 'left_ftr_img');
pdf_page_hdrftr_cleanupUsrTxtImg('mid_ftr_content', 'mid_ftr_text', 'mid_ftr_img');
pdf_page_hdrftr_cleanupUsrTxtImg('right_ftr_content', 'right_ftr_text', 'right_ftr_img');

function pdf_page_hdrftr_cleanupUsrTxtImg(cell_content, cell_txt, cell_img) {
	var USR_TXT = 5;
	var USR_IMG = 6;
	var prevCellContent = previous.getValue(cell_content);
	var currCellContent = current.getValue(cell_content);
	if ( prevCellContent == USR_TXT && currCellContent != USR_TXT) 
		current.setValue(cell_txt, '');
	else if (prevCellContent == USR_IMG && currCellContent != USR_IMG) {
		var gr = new GlideRecord('sys_attachment');
		gr.addQuery('table_sys_id', current.getUniqueValue());
		gr.addQuery('file_name', cell_img);
		gr.query();
		if (gr.next())
			gr.deleteRecord();
	}
}
