"use client";
import React, { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
const CalendarMonthView = () => {
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());
  const [selectedUser, setSelectedUser] = useState<string>(
    "Gayashan Madhuranga"
  );

  const startOfMonth = currentDate.startOf("month");
  const endOfMonth = currentDate.endOf("month");

  const daysInMonth: Dayjs[] = [];
  let day = startOfMonth.startOf("week"); // Start from the first Sunday before the month

  while (day.isBefore(endOfMonth.endOf("week"))) {
    daysInMonth.push(day);
    day = day.add(1, "day");
  }

  const handlePrevMonth = () =>
    setCurrentDate(currentDate.subtract(1, "month"));
  const handleNextMonth = () => setCurrentDate(currentDate.add(1, "month"));

  const renderDayCell = (day: Dayjs) => {
    const isCurrentMonth = day.month() === currentDate.month();
    const isToday = day.isSame(dayjs(), "day");

    return (
      <td
        key={day.toString()}
        className={`p-2 border ${!isCurrentMonth ? "bg-gray-100" : ""}`}
      >
        <div
          className={`flex flex-col items-center justify-between h-20 ${
            isToday ? "bg-blue-100 border-blue-500 border" : "bg-white"
          }`}
        >
          <div className="text-sm font-semibold">{day.date()}</div>
          {isCurrentMonth && (
            <button
              className="text-blue-500 hover:bg-blue-100 rounded-full p-1"
              onClick={() => alert(`Add entry for ${day.format("MMM D")}`)}
            >
              +
            </button>
          )}
        </div>
      </td>
    );
  };

  const daysInRows = () => {
    // Group the days in a 2D array for each week (rows)
    const weeks: Dayjs[][] = [];
    for (let i = 0; i < daysInMonth.length; i += 7) {
      weeks.push(daysInMonth.slice(i, i + 7));
    }
    return weeks;
  };

  return (
    <div className="">
      {/* Navigation */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
       

          <button
                      className="text-gray-600 hover:text-blue-600 text-xl font-semibold"
                      onClick={handlePrevMonth}
                    >
                      <IoIosArrowBack />
                    </button>
        
                    <button
                      className="text-gray-600 hover:text-blue-600 text-xl font-semibold"
                      onClick={handleNextMonth}
                    >
                      <IoIosArrowForward />
                    </button>
          
                    <span className="mx-2 text-lg font-semibold">
            {currentDate.format("MMMM YYYY")}
          </span>
        </div>
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="border p-2 rounded"
        >
          <option>Gayashan Madhuranga</option>
          <option>Another User</option>
        </select>
      </div>

      {/* Calendar */}
      <table className="table-auto bg-white p-4 w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <th key={day} className="p-2 border">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {daysInRows().map((week, i) => (
            <tr key={i} className="border">
              {week.map((day) => renderDayCell(day))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="mt-4">
        <table className="table-auto w-full border-collapse border">
          <thead>
            <tr>
              <th className="p-2 border">Weekly Totals</th>
              <th className="p-2 border">Hours</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                <td className="p-2 border">Week {i + 1}</td>
                <td className="p-2 border text-right">0:00</td>
              </tr>
            ))}
            <tr>
              <td className="p-2 border font-bold">Monthly Total</td>
              <td className="p-2 border font-bold text-right">0:00</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CalendarMonthView;
