/*=============================================================================
#     FileName: jquery.qTab.js
#         Desc: A tab plugin
#       Author: Smeagol
#        Email: star212417@163.com
#     HomePage: http://www.quxing.info
#      Version: 1.0.1
#   LastChange: 2012-03-04 20:22:45
#      History:
=============================================================================*/
(function($) {

	var methods = {
		init: function(options) {
			return this.each(function() {
				var opts = $.extend({},$.fn.qTab.defaults, options);
				var $this = $(this); //当前tabs对象
				$this.data("opts",opts);
				var hoverTimer;//hover计时器
				var $tabs_title = $this.find(opts.titleClass);//所有tab标签
				if (opts.eventType == "mouseover") {
					$tabs_title.delegate("a","mouseover mouseout",function(e) {
						if(e.type == "mouseover") {
							var obj = $(this);
							hoverTimer = setTimeout(function() {
								methods.select.call($this,obj.index());
							}, opts.timeout)
						}else{
							clearTimeout(hoverTimer);
						}
					});
				} else {
					$tabs_title.delegate("a",opts.eventType, function() {
						!$(this).hasClass(opts.className) && methods.select.call($this,$(this).index());
					});
				}
			});
		},
		//选择一个tab
		select: function(i) {
			var _selectedContent = this.find(this.data("opts").contentClass).children().eq(i);
			var _selectedTitle = this.find(this.data("opts").titleClass).children().eq(i);
			_selectedTitle.show().addClass("selected").siblings().removeClass("selected");
			_selectedContent.show().siblings().hide();
			if (this.data("opts").ajax) {
				_selectedContent.addClass("loading").load(_selectedTitle.attr("href"),function() {
					_selectedContent.removeClass("loading");
				});
			};
			this.data("opts").eventCallback.call(_selectedTitle);
		},
		//添加一个tab
		addTab: function(tab) {
			this.find(this.data("opts").titleClass).append("<a href=\"javascript:void(0)\">"+tab+"</a>");
			this.find(this.data("opts").contentClass).append("<li/>");
		}
	};

	$.fn.qTab = function(method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || ! method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.qtab');
		}
	};
	//默认设置
	$.fn.qTab.defaults = {
		eventType: 'click',
		timeout: 300,
		ajax: false,
		eventCallback: function(){},
		titleClass: '.tabs_title',
		contentClass: '.tabs_content'
	};

})(jQuery);

