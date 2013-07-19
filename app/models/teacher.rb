class Teacher < ActiveRecord::Base
  attr_accessible :name, :starttimehours, :starttimeminutes, :endtimehours, :endtimeminutes, :teachingonmonday, :teachingontuesday, :teachingonwednesday, :teachingonthursday, :teachingonfriday, :teachingonsaturday, :teachingonsunday
  has_many :lessons
  has_many :lessongroups, :through => :lessons
end
