/*=============================================================================
#     FileName: msp.source.js
#         Desc: for 店铺
#       Author: Smeagol
#        Email: star212417@163.com
#     HomePage: http://www.quxing.info
#      Version: 0.0.1
#   LastChange: 2012-04-23 12:01:57
#      History:
=============================================================================*/
seajs.config({
	alias: {
		//'mu': 'mustache/0.4.0/mu',
		//'less': 'less/1.3.0/less-debug',
		'zepto': 'zepto/1.0.0/zepto',
		'iscroll': 'iscroll/4.1.9/iscroll-debug',
		'slider': '../../../../base/modules/slider/slider'
		//'tip': '../../../../base/utils/tip/tip',
		//'uriBroker': './../../../../../base/utils/server/uriBroker',
		//'cdn': './../../../../../base/utils/server/cdn'
	},
	//preload: ['plugin-less'],
	debug: 1
});

define(function(require) {

	var drag = require('./drag');


    var v = new drag({
        hor : "lock",
        el: "#v",
        onDrag: function() {
            this.css("opacity","0.5");
        },
        onStop: function() {
            this.css("opacity","");
        }
    });
    var h = new drag({
        ver : "lock",
        el: "#h"
    });
    var all = new drag({
        el: "#all"
    });
});
