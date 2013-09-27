/*=============================================================================
#     FileName: jquery.fill.js
#         Desc: used to fill select with ajax
#       Author: Smeagol
#        Email: star212417@163.com
#     HomePage: http://www.quxing.info
#      Version: 0.0.1
#   LastChange: 2011-12-28 17:24:09
#      History:
=============================================================================*/
(function($) {

	$.fn.fill = function(options) {
		var opts = $.extend({},$.fn.fill.defaults, options);
		var self = this;
		return this.each(function() {
			var $this = $(this);
			$this.change(function() {
				var data;
				if(self.length == 1){
					data = {value: self.val()}
				}else{
					data = self.serialize()
				}
				fillit(data,$(opts.subElement),opts.url);
			});
		});
	};

	$.fn.fill.FUNCT = function() {

	};

	$.fn.fill.defaults = {
		subElement: "",
		url: "/"
	};

	function fillit(value, obj, url) {
		jQuery.ajax({
			type: 'post',
			url: url,
			global: false,
			dataType: 'json',
			async: false,
			data: value,
			success: function(json) {
				obj.html("");
				for(var a = 0; a<json.length; a++) {
					obj.append("<option value="+json[a].value+">"+json[a].option+"</option>");
				}
			},
			error: function(XMLHttpRequest, textStatus) {
				console.log(textStatus);
			}
		});

	}

})(jQuery);

