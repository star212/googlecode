$(function(){
	if($.browser.msie&&$.browser.version=="6.0"&&$("html")[0].scrollHeight>$("html").height()) $("html").css("overflowY","scroll");
}); 

$(function(){// dom元素加载完毕
	//$("#js_com_table tr:even").css("backgroundColor","#f9f8fd");
//	   获取id为tb的元素,然后寻找他下面的tbody标签，再寻找tbody下索引值是偶数的tr元素,改变它的背景色.
	$("#js_com_table tr").mouseover(function(){  //如果鼠标移到class为js_com_table的表格的tr上时，执行函数
		$(this).css("backgroundColor","#fdeec3");}).mouseout(function(){$(this).css("backgroundColor","#ffffff");})})

