"use client";

import { useState } from "react";
import type { PeLicense } from "@/lib/licenses";
import {
  getRenewalStatus,
  getRenewalStatusClassName,
} from "@/lib/renewal-status";
import { LicenseEditDialog } from "./LicenseEditDialog";

type LicenseTableProps = {
  licenses: PeLicense[];
  onUpdate: (license: PeLicense) => void;
  onDelete: (licenseId: string) => void;
};

export function LicenseTable({
  licenses,
  onUpdate,
  onDelete,
}: LicenseTableProps) {
  const [editingLicense, setEditingLicense] = useState<PeLicense | null>(null);

  function handleDelete(license: PeLicense) {
    const confirmed = window.confirm(
      `Delete ${license.state} license ${license.licenseNumber}?`,
    );

    if (confirmed) {
      onDelete(license.id);
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
              <th>Comments</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {licenses.map((license) => {
              const renewalStatus = getRenewalStatus(license.expiryDate);

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
                <td>{license.comments || "—"}</td>
                <td>
                  <div className="row-actions">
                    <button
                      type="button"
                      className="button secondary button-small"
                      onClick={() => setEditingLicense(license)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="button danger button-small"
                      onClick={() => handleDelete(license)}
                    >
                      Delete
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
          onSave={(updatedLicense) => {
            onUpdate(updatedLicense);
            setEditingLicense(null);
          }}
          onClose={() => setEditingLicense(null)}
        />
      ) : null}
    </>
  );
}
