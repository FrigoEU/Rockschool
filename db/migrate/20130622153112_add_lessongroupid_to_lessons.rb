class AddLessongroupidToLessons < ActiveRecord::Migration
  def change
    add_column :lessons, :lessongroup_id, :integer
  end
end
