class RemoveDatesAndTimesFromTeachers < ActiveRecord::Migration
  def up
    remove_column :teachers, :starttimehours
    remove_column :teachers, :teachingonmonday
    remove_column :teachers, :starttimehours
    remove_column :teachers, :starttimeminutes
    remove_column :teachers, :endtimehours
    remove_column :teachers, :endtimeminutes
    remove_column :teachers, :teachingonmonday
    remove_column :teachers, :teachingontuesday
    remove_column :teachers, :teachingonwednesday
    remove_column :teachers, :teachingonthursday
    remove_column :teachers, :teachingonfriday
    remove_column :teachers, :teachingonsaturday
    remove_column :teachers, :teachingonsunday
  end


  def down
    add_column :teachers, :teachingonmonday, :boolean
    add_column :teachers, :starttimehours, :integer
    add_column :teachers, :starttimehours, :integer
    add_column :teachers, :starttimeminutes, :integer
    add_column :teachers, :endtimehours, :integer
    add_column :teachers, :endtimeminutes, :boolean
    add_column :teachers, :teachingonmonday, :boolean
    add_column :teachers, :teachingontuesday, :boolean
    add_column :teachers, :teachingonwednesday, :boolean
    add_column :teachers, :teachingonthursday, :boolean
    add_column :teachers, :teachingonfriday, :boolean
    add_column :teachers, :teachingonsaturday, :boolean
    add_column :teachers, :teachingonsunday, :boolean
  end
end
