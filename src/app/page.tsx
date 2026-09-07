"use client";

import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { useEffect, useState } from "react";
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
  searchLicenses,
  type PeLicense,
} from "@/lib/licenses";
import { ALL_STATES_VALUE } from "@/lib/us-states";
import { LicenseEditDialog } from "@/components/LicenseEditDialog";

async function persistLicenses(licenses: PeLicense[]) {
  const response = await fetch("/api/licenses", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ licenses }),
  });
  if (!response.ok) {
    const data = (await response.json()) as { error?: string };
    throw new Error(data.error || "Failed to save licenses.");
  }
}

async function persistEngineers(engineers: string[]) {
  const response = await fetch("/api/engineers", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ engineers }),
  });
  if (!response.ok) {
    const data = (await response.json()) as { error?: string };
    throw new Error(data.error || "Failed to save engineers.");
  }
}

export default function Home() {
  const isAuthenticated = useIsAuthenticated();
  const { accounts } = useMsal();
  const [engineerNames, setEngineerNames] = useState<string[]>([]);
  const [selectedName, setSelectedName] = useState("");
  const [selectedState, setSelectedState] = useState(ALL_STATES_VALUE);
  const [licenses, setLicenses] = useState<PeLicense[]>([]);
  const [results, setResults] = useState<PeLicense[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [addingLicense, setAddingLicense] = useState<PeLicense | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const authenticatedEmail = isAuthenticated
    ? getAccountEmail(accounts[0])
    : "";
  const isAuthorized =
    isAuthenticated && isAllowedOrganizationEmail(authenticatedEmail);
  const displayName = accounts[0]?.name ?? authenticatedEmail;

  useEffect(() => {
    let cancelled = false;

    async function loadDashboardData() {
      try {
        const [licensesResponse, engineersResponse] = await Promise.all([
          fetch("/api/licenses"),
          fetch("/api/engineers"),
        ]);

        if (!licensesResponse.ok || !engineersResponse.ok) {
          throw new Error("Could not load saved dashboard data.");
        }

        const licensesData = (await licensesResponse.json()) as {
          licenses?: PeLicense[];
        };
        const engineersData = (await engineersResponse.json()) as {
          engineers?: string[];
        };

        if (cancelled) {
          return;
        }

        setLicenses(licensesData.licenses ?? []);
        setEngineerNames(engineersData.engineers ?? []);
        setDataError(null);
      } catch (error) {
        if (!cancelled) {
          setDataError(
            error instanceof Error
              ? error.message
              : "Could not load saved dashboard data.",
          );
        }
      } finally {
        if (!cancelled) {
          setDataReady(true);
        }
      }
    }

    void loadDashboardData();
    return () => {
      cancelled = true;
    };
  }, []);

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

  async function handleUpdateLicense(updatedLicense: PeLicense) {
    const nextLicenses = licenses.map((license) =>
      license.id === updatedLicense.id ? updatedLicense : license,
    );
    const nextResults = results.map((license) =>
      license.id === updatedLicense.id ? updatedLicense : license,
    );

    setLicenses(nextLicenses);
    setResults(nextResults);
    setSearchError(null);

    try {
      await persistLicenses(nextLicenses);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save license.";
      setSearchError(message);
      throw error;
    }
  }

  async function handleDeleteLicense(licenseId: string) {
    const nextLicenses = licenses.filter((license) => license.id !== licenseId);
    const nextResults = results.filter((license) => license.id !== licenseId);

    setLicenses(nextLicenses);
    setResults(nextResults);
    setSearchError(null);

    try {
      await persistLicenses(nextLicenses);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save licenses.";
      setSearchError(message);
      throw error;
    }

    void fetch(`/api/files/${encodeURIComponent(licenseId)}`, {
      method: "DELETE",
    });
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

    const nextEngineers = [...engineerNames, name].sort((a, b) =>
      a.localeCompare(b),
    );
    setEngineerNames(nextEngineers);
    setSelectedName(name);
    setSearchError(null);
    setIsAddingUser(false);
    void persistEngineers(nextEngineers).catch((error: unknown) => {
      setSearchError(
        error instanceof Error ? error.message : "Failed to save user.",
      );
    });
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

    const removedIds = licenses
      .filter((license) => license.engineerName === selectedName)
      .map((license) => license.id);

    const nextEngineers = engineerNames.filter((name) => name !== selectedName);
    const nextLicenses = licenses.filter(
      (license) => license.engineerName !== selectedName,
    );

    setEngineerNames(nextEngineers);
    setLicenses(nextLicenses);
    setResults([]);
    setHasSearched(false);
    setSelectedName("");
    setSearchError(null);

    void persistEngineers(nextEngineers).catch((error: unknown) => {
      setSearchError(
        error instanceof Error ? error.message : "Failed to save users.",
      );
    });
    void persistLicenses(nextLicenses).catch((error: unknown) => {
      setSearchError(
        error instanceof Error ? error.message : "Failed to save licenses.",
      );
    });

    for (const licenseId of removedIds) {
      void fetch(`/api/files/${encodeURIComponent(licenseId)}`, {
        method: "DELETE",
      });
    }
  }

  async function handleSaveNewLicense(newLicense: PeLicense) {
    const updatedLicenses = [...licenses, newLicense];
    setLicenses(updatedLicenses);
    setSearchError(null);

    try {
      await persistLicenses(updatedLicenses);
      setAddingLicense(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save license.";
      setSearchError(message);
      throw error;
    }

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
          ) : !dataReady ? (
            <>
              <div className="divider" />
              <p className="welcome-message">Loading saved data…</p>
            </>
          ) : (
            <>
              <p className="welcome-message">
                Welcome, <strong>{displayName}</strong>.
              </p>
              <div className="divider" />

              {dataError ? (
                <p className="form-message error" role="alert">
                  {dataError}
                </p>
              ) : null}

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
