/*=============================================================================
#     FileName: common.js
#         Desc:  js used usually
#       Author: Smeagol
#        Email: star212417@163.com
#     HomePage: http://www.quxing.info
#      Version: 0.0.1
#   LastChange: 2011-11-23 09:24:15
#      History:
=============================================================================*/

//图片预加载（可能有问题，未试验）
(function($) {
  var cache = [];
  // Arguments are image paths relative to the current page.
  $.preLoadImages = function() {
    var args_len = arguments.length;
    for (var i = args_len; i--;) {
      var cacheImage = document.createElement('img');
      cacheImage.src = arguments[i];
      cache.push(cacheImage);
    }
  }

jQuery.preLoadImages("image1.gif", "/path/to/image2.png");

//在新窗口打开链接 (target=”blank”)
$('a[@rel$='external']').click(function(){
     this.target = "_blank";
});

/*
   Usage:
   <a href="http://www.catswhocode.com" rel="external">catswhocode.com</a>
*/

//平滑滚动页面到某个锚点
$(document).ready(function() {
	$("a.topLink").click(function() {
		$("html, body").animate({
			scrollTop: $($(this).attr("href")).offset().top + "px"
		}, {
			duration: 500,
			easing: "swing"
		});
		return false;
	});
});

//制作等高的列
var max_height = 0;
$("div.col").each(function(){
    if ($(this).height() > max_height) { max_height = $(this).height(); }
});
$("div.col").height(max_height);

//测试浏览器是否支持某些 CSS3 属性
var supports = (function() {
   var div = document.createElement('div'),
      vendors = 'Khtml Ms O Moz Webkit'.split(' '),
      len = vendors.length;

   return function(prop) {
      if ( prop in div.style ) return true;

      prop = prop.replace(/^[a-z]/, function(val) {
         return val.toUpperCase();
      });

      while(len--) {
         if ( vendors[len] + prop in div.style ) {
            // browser supports box-shadow. Do what you need.
            // Or use a bang (!) to test if the browser doesn't.
            return true;
         }
      }
      return false;
   };
})();

if ( supports('textShadow') ) {
   document.documentElement.className += ' textShadow';
}


//获取 URL 中传递的参数
$.urlParam = function(name){
	var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
	if (!results) { return 0; }
	return results[1] || 0;
}

// 禁用表单的回车键提交
$("#form").keypress(function(e) {
  if (e.which == 13) {
    return false;
  }
});

