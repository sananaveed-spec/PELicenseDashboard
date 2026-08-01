"use client";

import { stateOptions } from "@/lib/state-abbreviations";
import { ALL_STATES_VALUE } from "@/lib/us-states";

type DashboardFiltersProps = {
  engineerNames: string[];
  selectedName: string;
  selectedState: string;
  onNameChange: (value: string) => void;
  onStateChange: (value: string) => void;
  onAddUserClick: () => void;
  onDeleteUserClick: () => void;
};

export function DashboardFilters({
  engineerNames,
  selectedName,
  selectedState,
  onNameChange,
  onStateChange,
  onAddUserClick,
  onDeleteUserClick,
}: DashboardFiltersProps) {
  return (
    <div className="filters">
      <section className="panel">
        <div className="field-label-row">
          <label className="field-label" htmlFor="engineer-name">
            Select Name
          </label>
          <div className="field-label-actions">
            <button
              type="button"
              className="button secondary button-small"
              onClick={onAddUserClick}
            >
              Add New User
            </button>
            <button
              type="button"
              className="button danger button-small"
              onClick={onDeleteUserClick}
              disabled={!selectedName}
            >
              Delete
            </button>
          </div>
        </div>
        <select
          id="engineer-name"
          className="field-select"
          value={selectedName}
          onChange={(event) => onNameChange(event.target.value)}
        >
          <option value="">— Choose a name —</option>
          {engineerNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </section>

      <section className="panel">
        <label className="field-label" htmlFor="state">
          State
        </label>
        <select
          id="state"
          className="field-select"
          value={selectedState}
          onChange={(event) => onStateChange(event.target.value)}
        >
          <option value={ALL_STATES_VALUE}>All</option>
          {stateOptions.map((state) => (
            <option key={state.fullName} value={state.fullName}>
              {state.label}
            </option>
          ))}
        </select>
      </section>
    </div>
  );
}
