function Timer(id) {
    this.container = document.getElementById(id);
    Timer.prototype.begin = function(count,amount) {
            var container = this.container;
            setTimeout(function() {
                container.innerHTML = count > 0 ? count : "over";
                count -= 2;
                if(count >= 0) {
                    setTimeout(arguments.callee, 1000);
                    console.log(count);
                }
            }, 1000);
            return this;
    }
}

var timer1 = new Timer("timer1").begin(10,2);
