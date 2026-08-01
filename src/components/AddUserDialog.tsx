"use client";

import { useEffect, useState } from "react";

type AddUserDialogProps = {
  onSave: (name: string) => void;
  onClose: () => void;
};

export function AddUserDialog({ onSave, onClose }: AddUserDialogProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName("");
    setError(null);
  }, []);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();

    if (!trimmed) {
      setError("Enter a user name.");
      return;
    }

    onSave(trimmed);
  }

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div
        className="dialog-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-user-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="add-user-title" className="dialog-title">
          Add New User
        </h2>

        <form className="dialog-form" onSubmit={handleSubmit}>
          <label className="field-label" htmlFor="new-user-name">
            Name
          </label>
          <input
            id="new-user-name"
            className="field-input"
            value={name}
            autoFocus
            placeholder="Enter full name"
            onChange={(event) => {
              setName(event.target.value);
              setError(null);
            }}
          />

          {error ? (
            <p className="form-message error" role="alert">
              {error}
            </p>
          ) : null}

          <div className="dialog-actions">
            <button type="button" className="button secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="button primary">
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
