class CreateLessons < ActiveRecord::Migration
  def change
    create_table :lessons do |t|
      t.string :startTime
      t.string :dateTime
      t.integer :duration

      t.timestamps
    end
  end
end
