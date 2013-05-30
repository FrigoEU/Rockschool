class Lesson < ActiveRecord::Base
  attr_accessible :duration, :starttime, :status, :teacher_id, :student_id
  belongs_to :teacher
  belongs_to :student
end
