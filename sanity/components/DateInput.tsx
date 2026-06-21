"use client";

import React, { useCallback } from "react";
import ReactDatePicker, { registerLocale } from "react-datepicker";
import de from "date-fns/locale/de";
import { set, unset } from "sanity";
import type { StringInputProps } from "sanity";
import "react-datepicker/dist/react-datepicker.css";

registerLocale("de", de as unknown as Locale);

export function DateInput(props: StringInputProps) {
  const { value, onChange, readOnly } = props;

  // Add noon time to avoid timezone-shift issues when parsing YYYY-MM-DD
  const selectedDate = value ? new Date(`${value}T12:00:00`) : null;

  const handleChange = useCallback(
    (date: Date | null) => {
      if (!date) {
        onChange(unset());
        return;
      }
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      onChange(set(`${y}-${m}-${d}`));
    },
    [onChange]
  );

  return (
    <>
      <style>{`
        .sl-datepicker .react-datepicker {
          font-family: inherit;
          background-color: #1a1a1a;
          border: 1px solid #333;
          border-radius: 4px;
          color: #e5e5e5;
        }
        .sl-datepicker .react-datepicker__header {
          background-color: #111;
          border-bottom: 1px solid #333;
        }
        .sl-datepicker .react-datepicker__current-month,
        .sl-datepicker .react-datepicker__day-name {
          color: #e5e5e5;
        }
        .sl-datepicker .react-datepicker__day {
          color: #ccc;
          border-radius: 2px;
        }
        .sl-datepicker .react-datepicker__day:hover {
          background-color: #333;
          color: #fff;
        }
        .sl-datepicker .react-datepicker__day--selected {
          background-color: #ae0c00;
          color: #fff;
        }
        .sl-datepicker .react-datepicker__day--today {
          font-weight: bold;
          color: #ae0c00;
        }
        .sl-datepicker .react-datepicker__day--today.react-datepicker__day--selected {
          color: #fff;
        }
        .sl-datepicker .react-datepicker__day--outside-month {
          color: #555;
        }
        .sl-datepicker .react-datepicker__navigation-icon::before {
          border-color: #aaa;
        }
        .sl-datepicker .react-datepicker__navigation:hover .react-datepicker__navigation-icon::before {
          border-color: #fff;
        }
        .sl-datepicker input {
          background: var(--card-bg-color, #1a1a1a);
          border: 1px solid var(--card-border-color, #333);
          border-radius: 4px;
          color: var(--card-fg-color, #e5e5e5);
          font-size: 14px;
          padding: 6px 10px;
          width: 160px;
          outline: none;
        }
        .sl-datepicker input:focus {
          border-color: #ae0c00;
          box-shadow: 0 0 0 1px #ae0c00;
        }
      `}</style>
      <div className="sl-datepicker">
        <ReactDatePicker
          selected={selectedDate}
          onChange={handleChange}
          dateFormat="dd.MM.yyyy"
          locale="de"
          placeholderText="TT.MM.JJJJ"
          readOnly={readOnly ?? false}
          showPopperArrow={false}
          popperPlacement="bottom-start"
        />
      </div>
    </>
  );
}
