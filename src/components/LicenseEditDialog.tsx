"use client";

import { useEffect, useState } from "react";
import type { PeLicense } from "@/lib/licenses";
import {
  getRenewalStatus,
  getRenewalStatusClassName,
} from "@/lib/renewal-status";
import { fromDateInputValue, toDateInputValue } from "@/lib/license-dates";
import { stateOptions } from "@/lib/state-abbreviations";

type LicenseEditDialogProps = {
  license: PeLicense;
  mode?: "add" | "edit";
  onSave: (license: PeLicense) => void;
  onClose: () => void;
};

export function LicenseEditDialog({
  license,
  mode = "edit",
  onSave,
  onClose,
}: LicenseEditDialogProps) {
  const [draft, setDraft] = useState(license);

  useEffect(() => {
    setDraft(license);
  }, [license]);

  function updateField<K extends keyof PeLicense>(
    field: K,
    value: PeLicense[K],
  ) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function handleStateChange(stateFullName: string) {
    const match = stateOptions.find((option) => option.fullName === stateFullName);
    setDraft((current) => ({
      ...current,
      stateFullName,
      state: match?.abbreviation ?? current.state,
    }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onSave(draft);
  }

  const renewalStatus = getRenewalStatus(draft.expiryDate);

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div
        className="dialog-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="license-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="license-dialog-title" className="dialog-title">
          {mode === "add" ? "Add New License Info" : "Edit License"}
        </h2>

        <form className="dialog-form" onSubmit={handleSubmit}>
          <label className="field-label" htmlFor="edit-state">
            State
          </label>
          <select
            id="edit-state"
            className="field-select"
            value={draft.stateFullName}
            onChange={(event) => handleStateChange(event.target.value)}
          >
            {stateOptions.map((option) => (
              <option key={option.fullName} value={option.fullName}>
                {option.label}
              </option>
            ))}
          </select>

          <label className="field-label" htmlFor="edit-license-type">
            License Type
          </label>
          <input
            id="edit-license-type"
            className="field-input"
            value={draft.licenseType}
            onChange={(event) => updateField("licenseType", event.target.value)}
          />

          <label className="field-label" htmlFor="edit-license-number">
            License Number
          </label>
          <input
            id="edit-license-number"
            className="field-input"
            value={draft.licenseNumber}
            onChange={(event) => updateField("licenseNumber", event.target.value)}
          />

          <label className="field-label" htmlFor="edit-issue-date">
            Issue Date
          </label>
          <input
            id="edit-issue-date"
            className="field-input field-date"
            type="date"
            value={toDateInputValue(draft.issueDate)}
            onChange={(event) =>
              updateField("issueDate", fromDateInputValue(event.target.value))
            }
          />

          <label className="field-label" htmlFor="edit-expiry-date">
            Expiry Date
          </label>
          <input
            id="edit-expiry-date"
            className="field-input field-date"
            type="date"
            value={toDateInputValue(draft.expiryDate)}
            onChange={(event) =>
              updateField("expiryDate", fromDateInputValue(event.target.value))
            }
          />

          <label className="field-label" htmlFor="edit-issuing-authority">
            Issuing Authority
          </label>
          <input
            id="edit-issuing-authority"
            className="field-input"
            value={draft.issuingAuthority}
            onChange={(event) =>
              updateField("issuingAuthority", event.target.value)
            }
          />

          <div className="renewal-status-preview">
            <span className="field-label">Renewal Status</span>
            <span className={getRenewalStatusClassName(renewalStatus)}>
              {renewalStatus}
            </span>
            <p className="renewal-status-hint">
              Calculated automatically from the expiry date.
            </p>
          </div>

          <label className="field-label" htmlFor="edit-comments">
            Comments
          </label>
          <textarea
            id="edit-comments"
            className="field-textarea"
            rows={3}
            value={draft.comments}
            onChange={(event) => updateField("comments", event.target.value)}
          />

          <div className="dialog-actions">
            <button type="button" className="button secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="button primary">
              {mode === "add" ? "Add License" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
