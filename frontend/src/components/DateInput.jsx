import React from 'react';

const DateInput = ({ onDateChange }) => {
  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 15);
  const maxDateString = maxDate.toISOString().split('T')[0];

  return (
    <div className="form-group">
      <label htmlFor="date" className="label">
        Date
      </label>
      <input
        type="date"
        id="date"
        min={today}
        max={maxDateString}
        defaultValue={today}
        onChange={(e) => onDateChange(e.target.value)}
        className="input"
      />
    </div>
  );
};

export default DateInput;