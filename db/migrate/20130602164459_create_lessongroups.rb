class CreateLessongroups < ActiveRecord::Migration
  def change
    create_table :lessongroups do |t|
      t.integer :maximum_number_of_students

      t.timestamps
    end
  end
end
