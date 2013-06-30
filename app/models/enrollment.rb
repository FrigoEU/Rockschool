include ApplicationHelper

# class EnrollmentValidator < ActiveModel::Validator
# 	def validate(record)
# 		unless record.lessongroup.valid?
# 			record.errors[:lessongroup] << 'Enrollment was not created because the Lessongroup was not created'
# 		end
# 	end
# end

class Enrollment < ActiveRecord::Base
	include ActiveModel::Validations

	attr_accessible :lessongroup_id, :paid, :student_id
	belongs_to :student
	belongs_to :lessongroup
	has_many :lessons, :through => :lessongroup
	#validates_with EnrollmentValidator

end

