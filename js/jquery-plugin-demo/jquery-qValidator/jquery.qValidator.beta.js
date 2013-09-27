/*=============================================================================
#     FileName: jquery.qValidator.js
#         Desc: 验证插件
#       Author: Smeagol
#        Email: star212417@163.com
#     HomePage: http://www.quxing.info
#      Version: 0.0.1
#   LastChange: 2011-12-02 09:08:45
#      History:
=============================================================================*/
(function($) {

	$.fn.qValidator = function(options) {

		var opts = $.extend({},$.fn.qValidator.defaults, options);
		return this.each(function() {
			var $this = $(this);
			var _fields = $this.find("input:not(:submit,:button,:reset,:image),select,textarea");
			console.log(_fields);
			$this.submit(function() {
				return validator(_fields,opts);
			});
		});
	};

	//$.fn.qValidator.FUNCT = function() {
	//};
	
	function validator(flds,opts) {
		var val = true;
		flds.each(function(i){
			if(!checkOne($(this),opts)){
				val = false;
				return false;
			};
		});
		return val;
	}
	function checkOne(obj,opts){
		var _class = obj.prop("class").split(" ");
		for (var i = 0; i < _class.length; i++) {
			for (var j = 0; j < opts.rules.length; j++) {
				if(opts.rules[j].name == _class[i]){
					if(!opts.rules[j].rule.test(obj.val())){
						showMsg(obj.attr("data-title") + opts.rules[j].msg , obj);
						obj.focus();
						return false;
					}
				}
			};
		};
		return true;
	}
	function showMsg(msg,obj){
		obj.attr("error",msg).twipsy({
			title: "error",
			trigger: "manual",
			placement: "right"
		}).twipsy('show');
	}
	$.fn.qValidator.defaults = {
		rules: [{
			name: "required",
			rule: /^.+$/,
			msg: "不能为空"
		},
		{
			name: "number",
			rule: /^\d+$/,
			msg: "只能为数字"
		}]
	};

})(jQuery);

