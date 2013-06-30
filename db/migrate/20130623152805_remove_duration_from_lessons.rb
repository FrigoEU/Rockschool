class RemoveDurationFromLessons < ActiveRecord::Migration
  def up
    remove_column :lessons, :duration
  end

  def down
    add_column :lessons, :duration, :integer
  end
end
