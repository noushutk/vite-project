import { useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../../lib/supabase";
import { toast } from "react-toastify";

const tableMap = {
  category: {
    table: "category",
    column: "id",
    fieldName: "catname",
    label: "Category Name",
  },
  brand: {
    table: "brands",
    column: "id",
    fieldName: "brname",
    label: "Brand Name",
  },
  unit: {
    table: "units",
    column: "id",
    fieldName: "unitname",
    label: "Unit Name",
  },
};

export default function AddMasterModal({ type, onClose }) {
  const config = tableMap[type];
  const [value, setValue] = useState("");

  if (!config) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation()

    if (!value.trim()) {
      toast.error(`${config.label} is required`);
      return;
    }

    // Get new ID
    const { data: newId, error: idError } = await supabase.rpc("get_next_id", {
      table_name: config.table,
      column_name: config.column,
    });

    if (idError) {
      toast.error("Failed to get new ID");
      return;
    }

    // Insert record
    const { error } = await supabase.from(config.table).insert([
      {
        [config.column]: newId,
        [config.fieldName]: value.trim(),
      },
    ]);

    if (error) {
      toast.error("Insert failed");
    } else {
      toast.success(`${config.label} added`);
      onClose(); // close modal and reload dropdowns
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm">
        <h2 className="text-lg font-bold mb-4">Add {config.label}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={config.label}
            className="input input-bordered w-full"
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
