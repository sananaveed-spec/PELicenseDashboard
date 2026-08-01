"use client";

import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { useState } from "react";
import { AuthHeader } from "@/components/AuthHeader";
import { AddUserDialog } from "@/components/AddUserDialog";
import { DashboardFilters } from "@/components/DashboardFilters";
import { LicenseTable } from "@/components/LicenseTable";
import { LoginPage } from "@/components/LoginPage";
import { UnauthorizedPage } from "@/components/UnauthorizedPage";
import {
  getAccountEmail,
  isAllowedOrganizationEmail,
} from "@/auth/organization";
import {
  createNewLicense,
  initialLicenses,
  searchLicenses,
  type PeLicense,
} from "@/lib/licenses";
import { ALL_STATES_VALUE } from "@/lib/us-states";
import { initialEngineers } from "@/lib/engineers";
import { LicenseEditDialog } from "@/components/LicenseEditDialog";

export default function Home() {
  const isAuthenticated = useIsAuthenticated();
  const { accounts } = useMsal();
  const [engineerNames, setEngineerNames] = useState<string[]>([
    ...initialEngineers,
  ]);
  const [selectedName, setSelectedName] = useState("");
  const [selectedState, setSelectedState] = useState(ALL_STATES_VALUE);
  const [licenses, setLicenses] = useState<PeLicense[]>(initialLicenses);
  const [results, setResults] = useState<PeLicense[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [addingLicense, setAddingLicense] = useState<PeLicense | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const authenticatedEmail = isAuthenticated
    ? getAccountEmail(accounts[0])
    : "";
  const isAuthorized =
    isAuthenticated && isAllowedOrganizationEmail(authenticatedEmail);
  const displayName = accounts[0]?.name ?? authenticatedEmail;

  function handleSearch() {
    if (!selectedName) {
      setSearchError("Select a name before searching.");
      setHasSearched(false);
      setResults([]);
      return;
    }

    setSearchError(null);
    setHasSearched(true);
    setResults(searchLicenses(licenses, selectedName, selectedState));
  }

  function handleUpdateLicense(updatedLicense: PeLicense) {
    setLicenses((current) =>
      current.map((license) =>
        license.id === updatedLicense.id ? updatedLicense : license,
      ),
    );
    setResults((current) =>
      current.map((license) =>
        license.id === updatedLicense.id ? updatedLicense : license,
      ),
    );
  }

  function handleDeleteLicense(licenseId: string) {
    setLicenses((current) =>
      current.filter((license) => license.id !== licenseId),
    );
    setResults((current) =>
      current.filter((license) => license.id !== licenseId),
    );
  }

  function handleAddLicenseClick() {
    if (!selectedName) {
      setSearchError("Select a name before adding license info.");
      return;
    }

    const defaultState =
      selectedState === ALL_STATES_VALUE ? "California" : selectedState;

    setSearchError(null);
    setAddingLicense(createNewLicense(selectedName, defaultState));
  }

  function handleSaveNewUser(name: string) {
    const alreadyExists = engineerNames.some(
      (existing) => existing.toLowerCase() === name.toLowerCase(),
    );

    if (alreadyExists) {
      setSearchError(`User "${name}" already exists.`);
      setIsAddingUser(false);
      return;
    }

    setEngineerNames((current) =>
      [...current, name].sort((a, b) => a.localeCompare(b)),
    );
    setSelectedName(name);
    setSearchError(null);
    setIsAddingUser(false);
  }

  function handleDeleteUser() {
    if (!selectedName) {
      setSearchError("Select a name before deleting.");
      return;
    }

    const confirmed = window.confirm(
      `Delete user "${selectedName}" and all of their license records?`,
    );

    if (!confirmed) {
      return;
    }

    setEngineerNames((current) =>
      current.filter((name) => name !== selectedName),
    );
    setLicenses((current) =>
      current.filter((license) => license.engineerName !== selectedName),
    );
    setResults([]);
    setHasSearched(false);
    setSelectedName("");
    setSearchError(null);
  }

  function handleSaveNewLicense(newLicense: PeLicense) {
    const updatedLicenses = [...licenses, newLicense];
    setLicenses(updatedLicenses);
    setAddingLicense(null);

    if (selectedName) {
      setHasSearched(true);
      setResults(
        searchLicenses(updatedLicenses, selectedName, selectedState),
      );
    }
  }

  return (
    <main className="page">
      <div className={`layout${isAuthorized ? " layout--dashboard" : ""}`}>
        {isAuthenticated ? <AuthHeader /> : null}

        <div className={`card${isAuthorized ? " card--dashboard" : ""}`}>
          <h1 className="dashboard-title">PE License Dashboard</h1>

          {!isAuthenticated ? (
            <>
              <div className="divider" />
              <LoginPage />
            </>
          ) : !isAuthorized ? (
            <>
              <div className="divider" />
              <UnauthorizedPage />
            </>
          ) : (
            <>
              <p className="welcome-message">
                Welcome, <strong>{displayName}</strong>.
              </p>
              <div className="divider" />
              <DashboardFilters
                engineerNames={engineerNames}
                selectedName={selectedName}
                selectedState={selectedState}
                onNameChange={(value) => {
                  setSelectedName(value);
                  setSearchError(null);
                }}
                onStateChange={(value) => {
                  setSelectedState(value);
                  setSearchError(null);
                }}
                onAddUserClick={() => {
                  setSearchError(null);
                  setIsAddingUser(true);
                }}
                onDeleteUserClick={handleDeleteUser}
              />

              <div className="dashboard-actions">
                <button
                  type="button"
                  className="button primary dashboard-action-button"
                  onClick={handleSearch}
                >
                  Search
                </button>

                <button
                  type="button"
                  className="button secondary dashboard-action-button"
                  onClick={handleAddLicenseClick}
                >
                  Add New License Info
                </button>
              </div>

              {searchError ? (
                <p className="form-message error" role="alert">
                  {searchError}
                </p>
              ) : null}

              {hasSearched ? (
                <LicenseTable
                  licenses={results}
                  onUpdate={handleUpdateLicense}
                  onDelete={handleDeleteLicense}
                />
              ) : null}

              {addingLicense ? (
                <LicenseEditDialog
                  license={addingLicense}
                  mode="add"
                  onSave={handleSaveNewLicense}
                  onClose={() => setAddingLicense(null)}
                />
              ) : null}

              {isAddingUser ? (
                <AddUserDialog
                  onSave={handleSaveNewUser}
                  onClose={() => setIsAddingUser(false)}
                />
              ) : null}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
