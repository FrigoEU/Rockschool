/*global Backbone, _, $, current_student*/

var Enrollment = Backbone.Model.extend({
    urlRoot: "/enrollments",
    parse: function (response) {
        var result = _.clone(response);
        var startTime = new Date(response.starttime);
        var endTime = new Date(response.endtime);
        result.startTime = startTime;
        result.endTime = endTime;
        return result;
    },
    getFormattedStarttime: function () {
        return this.get('startTime').toString("dddd, HH:mm");
    },
    getActions: function(){
        var actions = [];
        if (current_user_role == "admin") {
            actions = [EnrollmentActions.removeenrollment];
        
            if (this.get('approved') === false) {
                actions.push(EnrollmentActions.accept);
                actions.push(EnrollmentActions.reject);
                _.each(actions, function (value, key, list) {
                        if (list[key] == EnrollmentActions.removeenrollment) {list.splice(key, 1);}
                    });
            }
        }
        return actions;
    }
});
var Enrollments = Backbone.Collection.extend({
    model: Enrollment,
    url: "/enrollments",
    renderInto: function (options) {
        var el = options.el;
        var label = options.label;
        _.each(this.models, function (value, key, list) {
            var singleEnrollmentDiv = $('<div></div>');
            el.append(singleEnrollmentDiv);
            var enrollmentBox = new EnrollmentBoxView({
                enrollment: value,
                el: singleEnrollmentDiv,
                label: label
            });
            enrollmentBox.render();
        });
    }
});

var EnrollmentDialogView = Backbone.View.extend({
    initialize: function () {
        _.bindAll(this);
    },
    tagName: "div",
    id: "enrollmentDialog",
    events: {
    },
    render: function () {
        var studentName = '';
        if (current_student !== undefined) {studentName = current_student.getName();}

        $("body").append(Mustache.render(
            this.options.template.html(),{
            "studentName": studentName,
            "teacherName": this.teacher.getName(),
            "teachingDay": this.startTime.toString("ddd dd MMM yyyy"),
            "startLessonHour": this.startTime.toString("HH:mm")
        }));
        var enrollmentDialog = $('#'+this.id);
        //console.log("enrollmentDialog = " + enrollmentDialog);

        enrollmentDialog.dialog({
            autoOpen: true,
            height: 400,
            width: 450,
            modal: true,
            buttons:{
                    "Voer inschrijving in": this.makeEnrollment,
                    Cancel: function () {
                                $( this ).dialog( "close" );
                        }
                },
                close: function () {
                        //allFields.val( "" ).removeClass( "ui-state-error" );
                        $('#enrollmentDialog').remove();
                }
        });
        var source = _.map(allStudents.models, function (value, key, list) {
                return {label: value.getName(), id: value.id};
            });
        var self = this;
        enrollmentDialog.find( "#studentsSelect" ).autocomplete({
            minLength: 0,
            source: source,
            select: function ( event, ui ) {
                $( "#studentsSelect" ).val( ui.item.label );
                self.selectedStudent = allStudents.get(ui.item.id);
                return false;
            },
            open: function (event, ui) {
                $('.ui-autocomplete')
                .mCustomScrollbar();
            }
        })
        .data( "ui-autocomplete" )._renderItem = function ( ul, item ) {
          return $( "<li>" )
            .append( "<a>" + item.label + "</a>" )
            .appendTo( ul );
        };
    },
    makeEnrollment: function () {
        var type = $('input:radio[name="enrollmentType"]:checked').val();
        var startTime = this.startTime;
        //startTime.addMinutes(-this.startTime.getTimezoneOffset()); //Vuil, maar anders lukte het niet... Mss later nog eens herbekijken
        var student;
        if (current_student !== undefined) {student = current_student;}
        else {student = this.selectedStudent;}

        if (!this.startTime.dst()) {
            this.startTime.addMinutes(this.startTime.getTimezoneOffset());
        }
        var enrollment = new Enrollment({
            student: student,
            teacher: this.teacher,
            startTime: this.startTime,
            duration: this.duration,
            type: type,
            lessongroup_id: this.lessongroup_id
        });
        enrollment.save(null, {
            success: function (model, response, options) {
                $('#enrollmentDialog').remove();
                var lessons = model.get("lessons");
                for (var i = 0; i < lessons.length; i++) {
                    var lesson = Lesson.prototype.parse(lessons[i]);
                    moderator.addLessonToActiveSchedule(lesson);
                }
                
                moderator.reloadMainscreen();
            },
            error: function (model, response, options) {
                standardHTTPErrorHandling(model, response, options);
            }
        });
    }
});

var EnrollmentBoxView = Backbone.View.extend({
    initialize: function () {
        this.template = $('#enrollmentBoxTemplate');
    },
    events: {
        "click .enrollment": "showEnrollmentDropDown"
    },
    render: function () {
        var text;
        switch (this.options.label) {
            case "studentName":
                text = allStudents.get(this.options.enrollment.get('student_id')).getName();
            break;
            case "teacherName":
                text = allTeachers.get(this.options.enrollment.get('teacher_id')).getName();
            break;
        }
        var argumentHash = {text: text};
        argumentHash = _.extend(argumentHash, this.options.enrollment.toJSON());
        $(this.el).html(Mustache.to_html(this.template.html(), argumentHash));
    },
    showEnrollmentDropDown: function (event) {
        moderator.showEnrollmentDropDown(event.pageX, event.pageY, this.options.enrollment, this);
    }
});
var EnrollmentActions = {
    accept: {
        key:'accept',
        action: 'acceptenrollment',
        label: 'Accepteer inschrijving',
        func: function (callback) {
            this.save({'approved': true},{success: function () {callback.apply();}});
        }
    },
    reject: {
        key: 'reject',
        action:'removeenrollment',
        label: 'Keur inschrijving af',
        func: function (callback) {
            this.destroy({success: function () {
                callback.apply();
            }});
        }
    },
    // pay: {
    //     key: 'pay',
    //     action: 'payenrollment',
    //     label: 'Betaling inschrijving OK',
    //     func: function (callback) {
    //         this.save({'paid': true},{success: function () {callback.apply();}});
    //     }
    // },
    removeenrollment: {
        key: 'removeenrollment',
        action:'removeenrollment',
        label: 'Verwijder inschrijving',
        func: function (callback) {
            this.destroy({success: function () {
                callback.apply();
            }});
        }
    }
};
var EnrollmentsSearchStatussesArray = [{key: "unpaid", name: "Onbetaald"}, {key: "unapproved", name:"Nog niet goedgekeurd"}];

var EnrollmentDropDownView = DropDownView.extend({
    initialize: function () {
        this.template = $('#enrollmentDropDownTemplate');
    },
    events: {
        "click .status": "changeStatus",
        "click .details": "showDetails"
    },
    renderInnerHTML: function () {
        var choices = this.options.enrollment.getActions();
        
        var argumentHash= {
            studentName: allStudents.get(this.options.enrollment.get("student_id")).getName(),
            teacherName: allTeachers.get(this.options.enrollment.get("teacher_id")).getName(),
            datetime: this.options.enrollment.getFormattedStarttime(),
            choicesmenu: (choices.length > 0),
            choices: choices
        };
        argumentHash = _.extend(argumentHash, this.options.enrollment.toJSON());
        return Mustache.render(this.template.html(),argumentHash);
    },
    changeStatus: function (e) {
        var enrollmentAction = EnrollmentActions[$(e.target).data("key")];
        var self = this;
        enrollmentAction.func.apply(this.options.enrollment, [function () {self.options.originatingView.render();}]);
    },
    showDetails: function(e){
        moderator.showEnrollmentDetails(this.options.enrollment.id);
    }
});
var EnrollmentsSearchView = Backbone.View.extend({
    initialize: function () {

    },
    events: {
        "click input[type=radio]": "searchEnrollments"
    },
    render: function () {
        //To Do: map lessons naar array van hashes met oa. student name in!!
        $(this.el).html(Mustache.to_html(this.options.template.html(),{statusses: EnrollmentsSearchStatussesArray}));
        $(this.el).find("#statusses").buttonset();
        $(this.el).find("#enrollments").remove();
        $(this.el).find('#searchScreen').append('<div id="enrollments"></div>');
        this.collection.renderInto({
            el: $(this.el).find('#enrollments'),
            label: "studentName"
        });
        return this;
    },
    searchEnrollments: function (event) {
        var status = event.currentTarget.value;
        console.log("status = ", status);
        var self = this;
        this.collection.fetch({
            data: {'inquirystatus': status},
            success: function (model, response, options) {
                self.render();
            },
            error: function (model, response, options) {
                standardHTTPErrorHandling(model, response, options);
            }
        });
    }
});
var EnrollmentDetailsView = Backbone.View.extend({
    initialize: function(){
        this.childViews = [];
    },
    events: {
        "click #newInvoice": "showNewInvoiceDialog"
    },
    render: function () {
        $(this.el).html(Mustache.to_html(this.options.template.html(),{
            studentName: allStudents.get(this.enrollment.get('student_id')).getName(),
            teacherName: allTeachers.get(this.enrollment.get('teacher_id')).getName(),
            startTime: this.enrollment.getFormattedStarttime(),
            approvedText: (this.enrollment.get('approved') === true ? "Ja" : "Nee" )
        }));
        $(this.el).find("#newInvoice").button();
        this.getInvoices();
        this.getLessons();
    },
    getInvoices: function () {
        this.enrollment.invoices = new Invoices();
        
        var invoicesFetchSuccess = _.bind(function(collection, response, options){
            var invoicesView = new InvoicesView({
                collection: collection,
                el: $(this.el).find('#invoices')
            });
            invoicesView.render();
            this.childViews.push(invoicesView);
        }, this);
        
        this.enrollment.invoices.fetch({
            data: {enrollment_id: this.enrollment.id},
            success: invoicesFetchSuccess,
            error: standardHTTPErrorHandling
        });
    },
    getLessons: function(){
        this.enrollment.lessons = new Lessons();

        var lessonsFetchSuccess = _.bind(function(collection, response, options){
            var lessonsView = new LessonsView({
                collection: collection,
                el: $(this.el).find('#lessons')
            });
            lessonsView.render();
            this.childViews.push(lessonsView);
        }, this);
        
        this.enrollment.lessons.fetch({
            data: {enrollment_id: this.enrollment.id},
            success: lessonsFetchSuccess,
            error: standardHTTPErrorHandling
        });
    },
    showNewInvoiceDialog: function(){
        moderator.showDialog("newInvoiceDialog",{
            enrollment: this.enrollment
        });
    },
    killChildViews: function(){
        if (this.childViews){
            _.each(this.childViews, function(element, index, list){
                element.close();
                list.splice(index,1);
            });
        }
    },
    close: function(){
        this.killChildViews();
        this.remove();
        this.unbind();
    }
});