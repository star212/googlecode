/*=============================================================================
#     FileName: qx.js
#         Desc:  自己的框架开始建立了。
#       Author: Smeagol
#        Email: star212417@163.com
#     HomePage: http://www.quxing.info
#      Version: 0.0.1
#   LastChange: 2012-03-22 14:20:32
#      History:
=============================================================================*/
(function(window) {
	var qx = (function() {

		//qx的一个副本用内部构件对象，再返回。
		var qxCopy = function() {};

		//qx的原型
		qxCopy.fn = qxCopy.prototype = {
			version: "0.0.1",
			createDate: new Date(),

			//用于类的继承，不能扩展一个对象
			extend: function(subClass, superClass) {
				var F = function() {};
				F.prototype = superClass.prototype;
				subClass.prototype = new F();
				subClass.prototype.constructor = subClass;
				subClass.superclass = superClass.prototype;
				if (superClass.prototype.constructor == Object.prototype.constructor) {
					superClass.prototype.constructor = superClass;
				}
			}
		};

		return new qxCopy;
	})();

	//安装器，可以挂在到一个命名空间
	window.qxInstall = function(scope, interface) {
		scope[interface] = qx;
	};
})(window);

