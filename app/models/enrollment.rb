include ApplicationHelper

class Enrollment < ActiveRecord::Base
	include ActiveModel::Validations

	attr_accessible :lessongroup_id, :paid, :student_id, :approved
	attr_accessor :starttime, :endtime, :teacher_id
	belongs_to :student
	belongs_to :lessongroup
	validates :lessongroup_id, :student_id, :presence => {:message => ' moet ingevuld zijn, Inschrijving niet opgeslagen'}
	validates :paid, :approved, inclusion: { in: [true, false], message: "Betaald en/of Goedgekeurd niet ingevuld bij aanmaak nieuwe invschrijving" }
	has_many :lessons, :through => :lessongroup

	def retrieve_virtual_attributes
		self.starttime = self.lessons.first.starttime
		self.endtime = self.lessons.first.endtime
		self.teacher_id = self.lessons.first.teacher_id
	end
	def as_json options=nil
      options ||= {}
      options[:methods] = ((options[:methods] || []) + [:starttime, :endtime, :teacher_id])
      super options
    end
end

