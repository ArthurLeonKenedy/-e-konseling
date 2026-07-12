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

    let className = "relative p-2 rounded-xl text-sm font-bold transition-all duration-300 text-center flex items-center justify-center aspect-square ";
    
    if (isPast) {
      className += "text-slate-300 opacity-40 cursor-not-allowed bg-slate-50/50";
    } else if (isBooked) {
      className += "bg-rose-50 text-rose-400 cursor-not-allowed opacity-90 border border-dashed border-rose-200 line-through decoration-rose-300";
    } else if (isSelected) {
      className += "bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-300/50 cursor-pointer transform scale-110 border border-emerald-400";
    } else {
      className += "text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer hover:scale-110 hover:shadow-md hover:shadow-emerald-100/50 border border-transparent hover:border-emerald-200 bg-white";
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
    <div className="bg-gradient-to-b from-white to-slate-50 border border-slate-200 p-4 sm:p-6 rounded-3xl shadow-xl shadow-slate-200/50 w-full relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600"></div>
      <div className="flex justify-between items-center mb-5 sm:mb-7">
        <button 
          type="button" 
          onClick={handlePrevMonth} 
          className="p-2 rounded-xl bg-white shadow-sm border border-slate-100 hover:bg-emerald-50 text-slate-500 transition-all hover:text-emerald-600 hover:border-emerald-200 hover:shadow-md active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        <div className="font-black text-slate-800 text-base sm:text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
          {monthNames[month]} {year}
        </div>
        <button 
          type="button" 
          onClick={handleNextMonth} 
          className="p-2 rounded-xl bg-white shadow-sm border border-slate-100 hover:bg-emerald-50 text-slate-500 transition-all hover:text-emerald-600 hover:border-emerald-200 hover:shadow-md active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-3 sm:mb-4 text-center text-[10px] sm:text-xs font-black text-emerald-600/70 uppercase tracking-widest">
        <div>Min</div><div>Sen</div><div>Sel</div><div>Rab</div><div>Kam</div><div>Jum</div><div>Sab</div>
      </div>
      <div className="grid grid-cols-7 gap-2 sm:gap-3">
        {days}
      </div>
      <div className="mt-6 sm:mt-8 flex gap-4 sm:gap-6 text-[10px] sm:text-xs font-bold text-slate-600 justify-center items-center bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
         <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-md shadow-emerald-200"></div> 
            <span>Dipilih</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border-2 border-dashed border-rose-300 bg-rose-50"></div> 
            <span>Penuh / Dipesan</span>
         </div>
      </div>
    </div>
  );
}
