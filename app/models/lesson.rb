class Lesson < ActiveRecord::Base
  attr_accessible :dateTime, :duration, :startTime
  belongs_to :teacher
  belongs_to :student
end
