/*=============================================================================
#     FileName: jquery.plugin-template.js
#         Desc: common plugin tempalte
#       Author: Smeagol
#        Email: star212417@163.com
#     HomePage: http://www.quxing.info
#      Version: 0.0.1
#   LastChange: 2011-12-04 21:35:51
#      History:
=============================================================================*/
(function($) {

	var methods = {
		init: function(options) {
			return this.each(function() {
                var opts = $.extend({},$.fn.tooltip.defaults, options);
				var $this = $(this),
				data = $this.data('tooltip'),
				tooltip = $('<div />', {
					text: $this.attr('title')
				});
				$this.data("opts",opts);
				console.log(data);
				console.log(tooltip);
				$("body").append(tooltip);
				alert(opts.className);
				methods.show();
				$(window).bind('resize.myname', methods.reposition);
				// If the plugin hasn't been initialized yet
				if (!data) {

					/*
             Do more setup stuff here
           */

					$(this).data('tooltip', {
						target: $this,
						tooltip: tooltip
					});

				}
				var mydata = $(this).data();
				console.log(mydata);

			});

		},
		destroy: function() {

			return this.each(function() {
				var $this = $(this),
				data = $this.data('tooltip');
				data.tooltip.remove();
				$this.removeData('tooltip');
				$(window).unbind('.myname');
			})

		},
		reposition: function() {
			console.log("reposition");
		},

		show: function() {
			alert("show");
		},
		hide: function() {
			alert("hide");
		},
		update: function(content) {
			alert(content)
		}
	};

	$.fn.tooltip = function(method) {

		// Method calling logic
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || ! method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.tooltip');
		}

	};
    $.fn.tooltip.defaults = {
		top: 'click',
		className: 'selected',
		timeout: 300,
		ajax: false
	};
})(jQuery);
