class AddDefaultPaidToInvoices < ActiveRecord::Migration
 	def up
    change_column :invoices, :paid, :boolean, :default => false
	end

	def down
	    change_column :invoices, :paid, :boolean, :default => nil
	end
end
