class RemoveUnusefulFieldsFromLessons < ActiveRecord::Migration
  def up
    remove_column :lessons, :startTime
    remove_column :lessons, :dateTime
  end

  def down
    add_column :lessons, :dateTime, :string
    add_column :lessons, :startTime, :string
  end
end
