if (current.left_hdr_content == 7 && current.mid_hdr_content == 7 && current.right_hdr_content == 7 &&
   current.left_ftr_content == 7 && current.mid_ftr_content == 7 && current.right_ftr_content == 7 )
	gs.addInfoMessage(gs.getMessage('Warning: You saved a template that will result in an empty header and footer in a PDF report that uses it'));
