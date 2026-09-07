"use client";

import { useEffect, useRef, useState } from "react";
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
  /** Called immediately when the attached PDF changes (replace/remove/upload). */
  onChange?: (license: PeLicense) => void;
  onClose: () => void;
};

export function LicenseEditDialog({
  license,
  mode = "edit",
  onSave,
  onChange,
  onClose,
}: LicenseEditDialogProps) {
  const [draft, setDraft] = useState(license);
  const [fileBusy, setFileBusy] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  async function handleUpload(file: File | undefined) {
    if (!file) {
      return;
    }

    setFileError(null);
    setFileBusy(true);

    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch(`/api/files/${encodeURIComponent(draft.id)}`, {
        method: "POST",
        body,
      });
      const data = (await response.json()) as { fileName?: string; error?: string };

      if (!response.ok || !data.fileName) {
        throw new Error(data.error || "Upload failed.");
      }

      const updated = { ...draft, fileName: data.fileName };
      setDraft(updated);
      onChange?.(updated);
    } catch (error) {
      setFileError(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setFileBusy(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleRemoveFile() {
    if (!draft.fileName) {
      return;
    }

    const confirmed = window.confirm(
      `Remove PDF "${draft.fileName}" from this license?`,
    );
    if (!confirmed) {
      return;
    }

    setFileError(null);
    setFileBusy(true);

    try {
      const response = await fetch(`/api/files/${encodeURIComponent(draft.id)}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Could not remove file.");
      }

      const updated = { ...draft, fileName: null };
      setDraft(updated);
      onChange?.(updated);
    } catch (error) {
      setFileError(
        error instanceof Error ? error.message : "Could not remove file.",
      );
    } finally {
      setFileBusy(false);
    }
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

          <label className="field-label" htmlFor="edit-address">
            Address
          </label>
          <input
            id="edit-address"
            className="field-input"
            value={draft.address}
            onChange={(event) => updateField("address", event.target.value)}
          />

          <label className="field-label" htmlFor="edit-business-name">
            Associated Business Name
          </label>
          <input
            id="edit-business-name"
            className="field-input"
            value={draft.associatedBusinessName}
            onChange={(event) =>
              updateField("associatedBusinessName", event.target.value)
            }
          />

          <label className="field-label" htmlFor="edit-verify-online">
            Verify Online (URL)
          </label>
          <input
            id="edit-verify-online"
            className="field-input"
            type="url"
            placeholder="https://..."
            value={draft.verifyOnlineUrl}
            onChange={(event) =>
              updateField("verifyOnlineUrl", event.target.value)
            }
          />

          <div className="file-field">
            <span className="field-label">File (PDF)</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="file-input-hidden"
              disabled={fileBusy}
              onChange={(event) => void handleUpload(event.target.files?.[0])}
            />

            {draft.fileName ? (
              <>
                <p className="file-field-current">
                  Current: <strong>{draft.fileName}</strong>
                </p>
                <div className="row-actions">
                  <a
                    className="button secondary button-small"
                    href={`/api/files/${encodeURIComponent(draft.id)}`}
                    download={draft.fileName}
                  >
                    Download
                  </a>
                  <button
                    type="button"
                    className="button secondary button-small"
                    disabled={fileBusy}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {fileBusy ? "Working…" : "Replace PDF"}
                  </button>
                  <button
                    type="button"
                    className="button danger button-small"
                    disabled={fileBusy}
                    onClick={() => void handleRemoveFile()}
                  >
                    Remove PDF
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="renewal-status-hint">
                  {mode === "add"
                    ? "Save the license first, then upload a PDF from the File column or reopen Edit."
                    : "No PDF attached yet."}
                </p>
                {mode === "edit" ? (
                  <button
                    type="button"
                    className="button secondary button-small"
                    disabled={fileBusy}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {fileBusy ? "Uploading…" : "Upload PDF"}
                  </button>
                ) : null}
              </>
            )}

            {fileError ? (
              <p className="form-message error" role="alert">
                {fileError}
              </p>
            ) : null}
          </div>

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
