class AddStartAndEndperdayToTeachers < ActiveRecord::Migration
  def change
    add_column :teachers, :start_hours_monday, :integer
    add_column :teachers, :start_minutes_monday, :integer
    add_column :teachers, :end_hours_monday, :integer
    add_column :teachers, :end_minutes_monday, :integer
    add_column :teachers, :start_hours_tuesday, :integer
    add_column :teachers, :start_minutes_tuesday, :integer
    add_column :teachers, :end_hours_tuesday, :integer
    add_column :teachers, :end_minutes_tuesday, :integer
    add_column :teachers, :start_hours_wednesday, :integer
    add_column :teachers, :start_minutes_wednesday, :integer
    add_column :teachers, :end_hours_wednesday, :integer
    add_column :teachers, :end_minutes_wednesday, :integer
    add_column :teachers, :start_hours_thursday, :integer
    add_column :teachers, :start_minutes_thursday, :integer
    add_column :teachers, :end_hours_thursday, :integer
    add_column :teachers, :end_minutes_thursday, :integer
    add_column :teachers, :start_hours_friday, :integer
    add_column :teachers, :start_minutes_friday, :integer
    add_column :teachers, :end_hours_friday, :integer
    add_column :teachers, :end_minutes_friday, :integer
    add_column :teachers, :start_hours_saturday, :integer
    add_column :teachers, :start_minutes_saturday, :integer
    add_column :teachers, :end_hours_saturday, :integer
    add_column :teachers, :end_minutes_saturday, :integer
    add_column :teachers, :start_hours_sunday, :integer
    add_column :teachers, :start_minutes_sunday, :integer
    add_column :teachers, :end_hours_sunday, :integer
    add_column :teachers, :end_minutes_sunday, :integer
    add_column :teachers, :bio, :string
    add_column :teachers, :courses, :string
  end
end
