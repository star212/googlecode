#=============================================================================
#     FileName: combo.pl
#         Desc: replace the url for combo the css files and js files
#       Author: Smeagol
#        Email: star212417@163.com
#     HomePage: http://www.quxing.info
#      Version: 0.1.1
#   LastChange: 2011-12-31 14:17:50
#      History:
#=============================================================================
use File::Find;
find({ wanted => \&process, follow => 0 }, '.');
sub process {
	/\.html$/s &&
	&combo ($_); 
}
#�ϲ��ļ�
sub combo {
	$" = ",";
	my($filename) = @_;
	if (! open HTML, "<",$filename){
		die "�Ҳ�����Ӧ���ļ�: $!";
	}
	if (! open OUT, ">","$filename.tmp"){
		die "�Ҳ�����Ӧ���ļ�: $!";
	}
	$afterHead = 0;
	while(<HTML>){
		if(!$afterHead){
			/href="([^"]*)"/ &&
			push(@cssarr,$1) &&
			next;
			/src="([^"]*)"/ &&
			push(@jsarr,$1) &&
			next;
		}
		if(/<\/head>/) {
			#���css�ϲ���url
			@cssarr = &generateUrl(@cssarr);
			print OUT "\t<link rel=\"stylesheet\" href=\"http://res.6677bank.com/min/@cssarr\" type=\"text/css\"/>\n";
			#���js�ϲ���url
			@jsarr = &generateUrl(@jsarr);
			print OUT "\t<script src=\"http://res.6677bank.com/min/@jsarr\"></script>\n";
			$afterHead = 1;
		}
		$_ =~ s/\r\n/\n/;
		print OUT $_;
	}
	#unlink $filename;
	#rename "$filename.tmp", $filename;
	print "�ļ���$filename �Ѵ��\n";
	@cssarr = ();
	@jsarr = ();
}
sub generateUrl {
	my($args) = "@_";
	my($b) = "";
	while($args =~ m/\/([^\/]*)\/([^,]*,?)(\/?\1\/[^,]*,?)+/) {
		$b .= "/$1";
		$args =~ s/\/$1//g;
	}
	$args =~ s/(^\/|(?<=,)\/)//g;
	if($b) {
		$b =~ s/^\///;
		return "b=$b&f=$args";
	}else{
		return "f=$args";
	}
}
