"use client";

import { useRef, useState } from "react";
import type { PeLicense } from "@/lib/licenses";
import {
  getRenewalStatus,
  getRenewalStatusClassName,
} from "@/lib/renewal-status";
import { LicenseEditDialog } from "./LicenseEditDialog";
import { toExternalHref } from "@/lib/verify-online";

type LicenseTableProps = {
  licenses: PeLicense[];
  onUpdate: (license: PeLicense) => void | Promise<void>;
  onDelete: (licenseId: string) => void | Promise<void>;
};

function DownloadIcon() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

export function LicenseTable({
  licenses,
  onUpdate,
  onDelete,
}: LicenseTableProps) {
  const [editingLicense, setEditingLicense] = useState<PeLicense | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  function handleDelete(license: PeLicense) {
    const confirmed = window.confirm(
      `Delete ${license.state} license ${license.licenseNumber}?`,
    );

    if (confirmed) {
      onDelete(license.id);
    }
  }

  async function handleUpload(license: PeLicense, file: File | undefined) {
    if (!file) {
      return;
    }

    setFileError(null);
    setBusyId(license.id);

    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch(`/api/files/${encodeURIComponent(license.id)}`, {
        method: "POST",
        body,
      });
      const data = (await response.json()) as { fileName?: string; error?: string };

      if (!response.ok || !data.fileName) {
        throw new Error(data.error || "Upload failed.");
      }

      onUpdate({ ...license, fileName: data.fileName });
    } catch (error) {
      setFileError(
        error instanceof Error ? error.message : "Upload failed.",
      );
    } finally {
      setBusyId(null);
      const input = fileInputRefs.current[license.id];
      if (input) {
        input.value = "";
      }
    }
  }

  if (licenses.length === 0) {
    return (
      <p className="table-empty" role="status">
        No licenses found for the selected name and state.
      </p>
    );
  }

  return (
    <>
      {fileError ? (
        <p className="form-message error" role="alert">
          {fileError}
        </p>
      ) : null}

      <div className="table-wrap">
        <table className="license-table">
          <thead>
            <tr>
              <th>State</th>
              <th>License Type</th>
              <th>License Number</th>
              <th>Issue Date</th>
              <th>Expiry Date</th>
              <th>Issuing Authority</th>
              <th>Renewal Status</th>
              <th>Address</th>
              <th>Associated Business Name</th>
              <th>Verify Online</th>
              <th>File</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {licenses.map((license) => {
              const renewalStatus = getRenewalStatus(license.expiryDate);
              const isBusy = busyId === license.id;

              return (
                <tr key={license.id}>
                  <td>{license.state}</td>
                  <td>{license.licenseType}</td>
                  <td>{license.licenseNumber}</td>
                  <td>{license.issueDate || "—"}</td>
                  <td>{license.expiryDate || "—"}</td>
                  <td>{license.issuingAuthority || "—"}</td>
                  <td>
                    <span className={getRenewalStatusClassName(renewalStatus)}>
                      {renewalStatus}
                    </span>
                  </td>
                  <td>{license.address || "—"}</td>
                  <td>{license.associatedBusinessName || "—"}</td>
                  <td>
                    {(() => {
                      const href = toExternalHref(license.verifyOnlineUrl);
                      if (!href) {
                        return "—";
                      }
                      return (
                        <a
                          className="verify-online-link"
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Verify Online
                        </a>
                      );
                    })()}
                  </td>
                  <td>
                    <div className="file-cell">
                      <input
                        ref={(element) => {
                          fileInputRefs.current[license.id] = element;
                        }}
                        type="file"
                        accept="application/pdf,.pdf"
                        className="file-input-hidden"
                        disabled={isBusy}
                        onChange={(event) =>
                          void handleUpload(license, event.target.files?.[0])
                        }
                      />

                      {license.fileName ? (
                        <div className="file-cell-row">
                          <span className="file-name" title={license.fileName}>
                            {license.fileName}
                          </span>
                          <a
                            className="button secondary button-icon"
                            href={`/api/files/${encodeURIComponent(license.id)}`}
                            download={license.fileName}
                            aria-label={`Download ${license.fileName}`}
                            title="Download"
                          >
                            <DownloadIcon />
                          </a>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="button secondary button-small"
                          disabled={isBusy}
                          onClick={() =>
                            fileInputRefs.current[license.id]?.click()
                          }
                        >
                          {isBusy ? "Uploading…" : "Upload PDF"}
                        </button>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        type="button"
                        className="button secondary button-icon"
                        aria-label="Edit license"
                        title="Edit"
                        onClick={() => setEditingLicense(license)}
                      >
                        <svg
                          aria-hidden="true"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="button danger button-icon"
                        aria-label="Delete license"
                        title="Delete"
                        onClick={() => handleDelete(license)}
                      >
                        <svg
                          aria-hidden="true"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editingLicense ? (
        <LicenseEditDialog
          license={editingLicense}
          onSave={async (updatedLicense) => {
            await onUpdate(updatedLicense);
            setEditingLicense(null);
          }}
          onChange={async (updatedLicense) => {
            await onUpdate(updatedLicense);
            setEditingLicense(updatedLicense);
          }}
          onClose={() => setEditingLicense(null)}
        />
      ) : null}
    </>
  );
}
