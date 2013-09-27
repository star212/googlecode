var regex={
	num: /^[1-9]\d*$/,	//正整数
	onlynum: /^(?!\d+$)/, //不是纯数字
	ascii: /^[\x00-\xFF]+$/,	//仅ACSII字符
	chinese: /^[\u4e00-\u9fa5]+$/,	//仅中文
	color: /^[a-fA-F0-9]{6}$/,	//颜色
	ip4: /^(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)\.(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)\.(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)\.(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)$/,	//ip地址
	ip:/(^| )([01]?\d\d?|2[0-4]\d|25[0-5])\.([01]?\d\d?|2[0-4]\d|25[0-5])\.([01]?\d\d?|2[0-4]\d|25[0-5])\.([01]?\d\d?|2[0-4]\d|25[0-5])( |$)/,
	letter: /^[A-Za-z]+$/,	//字母
	letter_l: /^[a-z]+$/,	//小写字母
	letter_u: /^[A-Z]+$/,	//大写字母
	mobile: /^0?(13[0-9]|15[012356789]|18[0236789]|14[57])[0-9]{8}$/,	//手机
	email: /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/, //邮箱地址，一般都内置了。
	notempty: /^\S+$/,	//非空
	allEmpty: /^(?!\s*$).*$/, //不全为空
	password: /^[A-Za-z0-9_-]+$/,	//密码
	picture: /(.*)\.(jpg|bmp|gif|ico|pcx|jpeg|tif|png|raw|tga)$/,	//图片
	qq: /^[1-9]*[1-9][0-9]*$/,	//QQ号码
	rar: /(.*)\.(rar|zip|7zip|tgz)$/,	//压缩文件
	tel: /^[0-9\-()（）]{7,18}$/,	//电话号码的函数(包括验证国内区号,国际区号,分机号)
	url: /^http[s]?:\/\/([\w-]+\.)+[\w-]+([\w-./?%&=]*)?$/,	//url
	username: /^(?=[A-Za-z0-9])[A-Za-z0-9_]*(?=[A-Za-z0-9]$)/,	//用户名，只能是字母、数字和下划线，不能以下划线开头或结尾
	deptname: /^[A-Za-z0-9_()（）\-\u4e00-\u9fa5]+$/,	//单位名
	zipcode: /^\d{6}$/,	//邮编
	realname:/^[\u4e00-\u9fa5]+$/,  // 真实姓名
	//ifelse:/(<)?\w+(?($1)>)/,  //条件判断
	NFA:/nfa|nfa not/, //用忽略量词优先判断NFA引擎
	DFA:/X(.+)+X/,//用捕获型挂号判断DFA引擎和POSIX NFA引擎
	filenames:/^(.*\/)([^\/]*)$/, //提取路径和文件名linux下
	quote:/"((?:\\.|[^\\"])*)"/,//提取双引号中的文本
	html_tag:/<(?:"[^"]*"|'[^']*'|[^'">])*>/g,//匹配html标签
	html_tag2:/<a\b("[^"]*"|'[^']*'|[^'">])*>(.*?)<\/a>/g,//匹配带属性的a标签
	http_url:/http:\/\/([^/:]+)(?::(\d+))?(\/.*)?$/ //http url地址,主机名，端口号，文件路径
};
alert(regex.allEmpty.test("  a "));