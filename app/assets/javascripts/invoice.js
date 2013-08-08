var Invoice = Backbone.Model.extend({
	urlRoot: "/invoices",
	dutchNames: {
		amount: "Bedrag",
		dueDate: "Vervaldatum"
	},
	validate: function(attrs, options){
		// return Validator.validate(this, {
		//	amount: "moreThanZero",
		//	dueDate: "validDate"
		// }, dutchNames);
		if (attrs.amount <= 0) {
			return "Bedrag moet groter of gelijk zijn aan nul";
		}
		if (attrs.dueDate == "Invalid Date"){
			return "Vervaldatum is niet het correcte formaat";
		}
	}
});
var InvoiceBoxView = ModelView.extend({
	tagName: "div",
	className: "invoiceBox",
	events:{
		"click *": "showInvoiceDropdown"
	},
	getTemplateHash: function(){
		return {
			invoice: this.model.toJSON()
		};
	},
	showInvoiceDropdown:function(e){
		moderator.showInvoiceDropDown(e.pageX, e.pageY, this.model);
	}
});
var Invoices = Backbone.Collection.extend({
	model: Invoice,
	url: "/invoices",
	render: function(){

	}
});
var InvoicesView = CollectionView.extend({
	events:{
	},
	modelView: "InvoiceBoxView",
	modelViewTemplateSelector: "#invoiceBoxTemplate"
});
var NewInvoiceDialog = Backbone.View.extend({
	initialize: function(){
		_.bindAll(this);
	},
	id: "newInvoiceDialog",
	render: function(){
		$("body").append(Mustache.render(
			this.options.template.html(),{
				studentName: allStudents.get(this.enrollment.get('student_id')).getName(),
				teacherName: allTeachers.get(this.enrollment.get('teacher_id')).getName(),
				startTime: this.enrollment.getFormattedStarttime(),
				dueDate: getFirstDateOfNextMonth().toString('dd/MM/yyyy'),
				amount: this.amount
			}));

		var newInvoiceDialog = $('#'+this.id);
		newInvoiceDialog.dialog({
			autoOpen: true,
			height: 400,
			width: 450,
			modal: true,
			buttons:{
				"Maak factuur": this.makeInvoice,
				Cancel: function () {
						$( this ).dialog( "close" );
				}
			},
			close: function () {
				$('#newInvoiceDialog').remove();
			}
		});
	},
	makeInvoice: function(){
		var amount = $(this.el).find("input[name=amount]").valplace();
		var dueDate = new Date($(this.el).find("input[name=dueDate]").valplace());
		var sendMail = $(this.el).find("input[name=sendMail]").prop('checked');
		var invoice = new Invoice({
			amount: amount,
			due_date: dueDate,
			sendMail: sendMail,
			enrollment_id: this.enrollment.id
		});
		if (invoice.isValid()){
			var invoiceSaveSuccess = _.bind(function() {
				moderator.showDialog("generalDialog",{
					title: "Factuur opgeslagen",
					text: "De nieuwe factuur is opgeslagen"
				});
				this.enrollment.invoices.add(invoice);
				$('#newInvoiceDialog').dialog("close");
			}, this);
			invoice.save(null, {
				success: invoiceSaveSuccess,
				error: standardHTTPErrorHandling
			});
		}
		else {standardValidationErrorHandling(invoice);}
	}
});
var InvoiceDropDownView = DropDownView.extend({
	initialize: function () {
		this.template = $('#invoiceDropDownTemplate');
	},
	events: {
		"click .pay": "payInvoice",
		"click .delete": "deleteInvoice"
	},
	renderInnerHTML: function () {
		var argumentHash= {
		};
		argumentHash = _.extend(argumentHash, this.options.invoice.toJSON());
		return Mustache.render(this.template.html(),argumentHash);
	},
	payInvoice: function (e) {
		this.options.invoice.save({
			paid: true
		},{
			error: standardHTTPErrorHandling
		});
	},
	deleteInvoice: function(e){
		this.options.invoice.destroy({
			success: function(){
				moderator.showDialog("generalDialog", {
					title: "Factuur verwijderd",
					text:"De factuur is verwijderd."
				});
			},
			error: standardHTTPErrorHandling
		});
	}
});
var getFirstDateOfNextMonth = function(){
	return Date.today().moveToFirstDayOfMonth().add(1).month();
};