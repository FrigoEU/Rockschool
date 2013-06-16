class AddHoursAndDaysToTeachers < ActiveRecord::Migration
  def change
    add_column :teachers, :starttimehours, :integer
    add_column :teachers, :starttimeminutes, :integer
    add_column :teachers, :endtimehours, :integer
    add_column :teachers, :endtimeminutes, :integer
    add_column :teachers, :teachingonmonday, :boolean
    add_column :teachers, :teachingontuesday, :boolean
    add_column :teachers, :teachingonwednesday, :boolean
    add_column :teachers, :teachingonthursday, :boolean
    add_column :teachers, :teachingonfriday, :boolean
    add_column :teachers, :teachingonsaturday, :boolean
    add_column :teachers, :teachingonsunday, :boolean
  end
end
