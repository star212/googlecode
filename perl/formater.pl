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
use HTML::FormatSomething;
find({ wanted => \&process, follow => 0 }, '.');
sub process {
	/\.html$/s &&
	&combo ($_); 
}
#合并文件
sub combo {
	$" = ",";
	my($filename) = @_;
	if (! open HTML, "<",$filename){
		die "找不到相应的文件: $!";
	}
	if (! open OUT, ">","$filename.tmp"){
		die "找不到相应的文件: $!";
	}
	$afterHead = 0;
	#unlink $filename;
	#rename "$filename.tmp", $filename;
	print "文件：$filename 已打包\n";
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
