class AddColumnToLessons < ActiveRecord::Migration
  def change
    add_column :lessons, :startTime, :datetime
  end
end
