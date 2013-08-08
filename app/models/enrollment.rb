include ApplicationHelper

class Enrollment < ActiveRecord::Base

	attr_accessible :lessongroup_id, :student_id, :approved
	attr_accessor :starttime, :endtime, :teacher_id, :paid
	belongs_to :student
	belongs_to :lessongroup, :dependent => :destroy
	validates :lessongroup_id, :student_id, :presence => {:message => ' moet ingevuld zijn, Inschrijving niet opgeslagen'}
	validates :approved, inclusion: { in: [true, false], message: "Betaald en/of Goedgekeurd niet ingevuld bij aanmaak nieuwe invschrijving" }
	has_many :lessons, :through => :lessongroup
	has_many :invoices

	def retrieve_virtual_attributes
		self.starttime = self.lessons.first.starttime
		self.endtime = self.lessons.first.endtime
		self.teacher_id = self.lessons.first.teacher_id

		self.paid = self.paid?
	end
	def paid?
		logger.debug("in paid?")
		logger.debug(self.invoices.count)
		paid = true
		self.invoices.each do |invoice|
			logger.debug(invoice.paid)
			if invoice.paid == false
				paid = false
				return paid
			end
		end
		paid
	end
	def calculate_invoice_amount
		self.lessons.count * 12.5
	end
	def as_json options=nil
      options ||= {}
      options[:methods] = ((options[:methods] || []) + [:starttime, :endtime, :teacher_id, :paid])
      super options
	end
end

