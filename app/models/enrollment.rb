class Enrollment < ActiveRecord::Base
  attr_accessible :lessongroup_id, :paid, :student_id
  belongs_to :student
  belongs_to :lessongroup
end
