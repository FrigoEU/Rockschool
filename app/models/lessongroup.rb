class Lessongroup < ActiveRecord::Base
  attr_accessible :maximum_number_of_students
  has_many :lessons
  has_many :enrollments
end
