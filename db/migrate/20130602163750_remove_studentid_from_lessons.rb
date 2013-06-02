class RemoveStudentidFromLessons < ActiveRecord::Migration
  def up
    remove_column :lessons, :student_id
  end

  def down
    add_column :lessons, :student_id, :string
  end
end
