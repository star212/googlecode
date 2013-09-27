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
		'zepto': 'zepto/1.0.0/zepto-debug',
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

    var $ = require('zepto'),
	search = require('./search'),
	autocomplete = require('./autocomplete'),
	range = require('./range');
    //var txtSearch = new search(".c-form-search",{callback:function(){
    //    alert(2);
    //}});
    $(".c-form-search").search({
        callback: function() {
            a.getHistory();
        }
    })

    var c = $("#jsrange").range({
        max: 60,
        value: 10,
        onSlide: function (num){
            $("#getValue").val(num);
        }
    });
    var b = $("#jsrange2").range({
        max: 60,
        single: false,
        onSlide: function (num){
            $("#getValue2").val(num);
        }
    });
    $("#range").on("change",function(){
        $("#value").html(this.value);
    })
    $("#getValue").click(function(){
        alert(c.getValue());
    });
    $("#getValue2").click(function(){
        alert(b.getValue());
    });
    $("#J_closeAutoComplete").click(function(){
        a.close();
    });

    var url = "http://suggest.taobao.com/sug";
    var clear = ["http://s.m.taobao.com/historyAjax.htm?delete=true&stype=1","http://s.m.taobao.com/historyAjax.htm?delete=true&stype=2","http://s.m.tmall.com/historyAjax.htm?delete=true&stype=1"];
    var a  = $('#J_Search').autoComplete({
        ajaxUrl: url,
        wrapEl:'.suggest',
        meatEl:'.suggest .meat',
        close:'.suggest .close',
        anim:true,
        history: ["http://s.m.taobao.com/historyAjax.htm?stype=1","http://s.m.taobao.com/historyAjax.htm?stype=2","http://s.m.tmall.com/historyAjax.htm?stype=1"],
        //history:"json/history.json", 
        addition: true,
        additionClass: ".addition",
        clearHistory: clear
    });
    console.log(a);
        
    console.log($(".c-form-txt-normal")[0]);
    $(".c-form-txt-normal")[0].oninput = function(e) {
        	var keyCode = 0, 
					e = e||event;
					
				keyCode = e.keyCode||e.which||e.charCode;
                console.log(e);
        alert(keyCode);
    }
});
