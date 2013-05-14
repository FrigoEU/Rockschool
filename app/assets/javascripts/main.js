window.onload = function() {
	//var allTeachers = getAllTeachers();

	$( "nav" ).buttonset();
	$("nav #teachers").on("click", function (event){
		moderator.setMainScreenTeacherIndex();
	});
	$("nav #students").on("click", function (event) {
		moderator.setMainScreenStudentIndex();
	});
   	$.fn.outside = function(ename, cb){
     	return this.each(function(){
        	var $this = $(this),
        	self = this;
       		$(document).bind(ename, function tempo(e){
        		if(e.target !== self){
            		cb.apply(self, [e]);
            		if(!self.parentNode) $(document).unbind(ename, tempo);
        		}
        	});
      	});
   	};
};