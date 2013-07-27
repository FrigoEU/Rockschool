class RemoveNameFromTeachers < ActiveRecord::Migration
  def up
    remove_column :teachers, :name
  end

  def down
  	add_column :teacher, :name, :string
  end
end
