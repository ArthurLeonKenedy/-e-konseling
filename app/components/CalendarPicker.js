"use client";

import React, { useState } from 'react';

export default function CalendarPicker({ selectedDate, onSelectDate, bookedDates = [] }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="p-2"></div>);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    dateObj.setHours(0, 0, 0, 0);
    
    // Format YYYY-MM-DD
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    
    const isBooked = bookedDates.includes(dateStr);
    const isPast = dateObj < today;
    const isSelected = selectedDate === dateStr;

    let className = "relative p-2 rounded-xl text-sm font-semibold transition-all duration-200 text-center flex items-center justify-center aspect-square ";
    
    if (isPast) {
      className += "text-slate-300 opacity-40 cursor-not-allowed";
    } else if (isBooked) {
      className += "bg-slate-50 text-slate-400 cursor-not-allowed opacity-80 border border-dashed border-slate-200 line-through decoration-slate-300";
    } else if (isSelected) {
      className += "bg-emerald-600 text-white shadow-md shadow-emerald-200/50 cursor-pointer transform scale-105";
    } else {
      className += "text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 cursor-pointer hover:scale-105 border border-transparent hover:border-emerald-100";
    }

    days.push(
      <div 
        key={d} 
        className={className}
        onClick={() => {
          if (!isPast && !isBooked) {
            onSelectDate(dateStr);
          }
        }}
        title={isBooked ? "Sudah ada jadwal" : ""}
      >
        {d}
      </div>
    );
  }

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  return (
    <div className="bg-white border border-slate-200/70 p-3 sm:p-5 rounded-2xl shadow-sm w-full">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <button 
          type="button" 
          onClick={handlePrevMonth} 
          className="p-1.5 sm:p-2 rounded-xl hover:bg-slate-50 text-slate-400 transition-all hover:text-emerald-600 hover:shadow-sm border border-transparent hover:border-slate-100"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        <div className="font-extrabold text-slate-800 text-sm sm:text-[15px] tracking-tight">
          {monthNames[month]} {year}
        </div>
        <button 
          type="button" 
          onClick={handleNextMonth} 
          className="p-1.5 sm:p-2 rounded-xl hover:bg-slate-50 text-slate-400 transition-all hover:text-emerald-600 hover:shadow-sm border border-transparent hover:border-slate-100"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-3 text-center text-[9px] sm:text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
        <div>Min</div><div>Sen</div><div>Sel</div><div>Rab</div><div>Kam</div><div>Jum</div><div>Sab</div>
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {days}
      </div>
      <div className="mt-4 sm:mt-6 flex gap-3 sm:gap-4 text-[10px] sm:text-[11px] font-bold text-slate-500 justify-center items-center">
         <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-emerald-600 shadow-sm shadow-emerald-200"></div> 
            <span>Dipilih</span>
         </div>
         <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded border border-dashed border-slate-300 bg-slate-50"></div> 
            <span>Penuh</span>
         </div>
      </div>
    </div>
  );
}
