class CreateEnrollments < ActiveRecord::Migration
  def change
    create_table :enrollments do |t|
      t.integer :student_id
      t.integer :lessongroup_id
      t.boolean :paid

      t.timestamps
    end
  end
end
