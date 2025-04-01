<template>
  <div class="events-calendar">
    <div class="calendar-controls">
      <button @click="previousMonth" class="calendar-nav-btn">
        <span class="nav-icon">&lt;</span>
      </button>
      <h3 class="current-month">{{ currentMonthName }} {{ currentYear }}</h3>
      <button @click="nextMonth" class="calendar-nav-btn">
        <span class="nav-icon">&gt;</span>
      </button>
    </div>
    
    <div class="calendar-grid">
      <div class="calendar-weekday" v-for="day in weekDays" :key="day">{{ day }}</div>
      <div
        v-for="(day, index) in calendarDays"
        :key="index"
        :class="[
          'calendar-day',
          { 'other-month': !day.isCurrentMonth },
          { 'has-event': day.hasEvent },
          { 'today': day.isToday }
        ]"
        @click="selectDay(day)"
      >
        <span class="day-number">{{ day.dayNumber }}</span>
        <div v-if="day.hasEvent" class="event-indicators">
          <div 
            v-for="(event, eventIndex) in day.events" 
            :key="eventIndex" 
            class="event-dot"
            :class="event.type"
            :title="event.name"
          ></div>
        </div>
      </div>
    </div>
    
    <div v-if="selectedDay && selectedDay.events.length > 0" class="selected-day-events">
      <h3>{{ formatSelectedDay() }}</h3>
      <div v-for="(event, index) in selectedDay.events" :key="index" class="day-event">
        <div class="event-type-indicator" :class="event.type"></div>
        <div class="event-details">
          <h4>{{ event.name }}</h4>
          <p>
            <span v-if="event.type === 'theme-week'">Săptămâna tematică</span>
            <span v-else-if="event.type === 'theme-day'">Ziua tematică</span>
            <span v-else-if="event.type === 'special-day'">Ziua specială</span>
          </p>
          <router-link 
            :to="getEventLink(event)" 
            class="view-event-btn"
          >
            <span>Vezi detalii</span>
            <span class="btn-arrow">→</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EventsCalendar',
  props: {
    themes: {
      type: Array,
      default: () => []
    },
    specialDays: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      currentDate: new Date(),
      selectedDay: null,
      weekDays: ['D', 'L', 'Ma', 'Mi', 'J', 'V', 'S']
    };
  },
  computed: {
    currentMonthName() {
      const monthNames = [
        'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
        'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'
      ];
      return monthNames[this.currentDate.getMonth()];
    },
    currentYear() {
      return this.currentDate.getFullYear();
    },
    calendarDays() {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();
      
      // Get the first day of the month
      const firstDayOfMonth = new Date(year, month, 1);
      // Get the last day of the month
      const lastDayOfMonth = new Date(year, month + 1, 0);
      
      // Get the day of week for the first day (0-6, 0 is Sunday)
      const firstDayOfWeek = firstDayOfMonth.getDay();
      
      // Calculate days from previous month to show
      const daysFromPrevMonth = firstDayOfWeek;
      
      // Calculate total days to show (previous month days + current month days + next month days to fill grid)
      const totalDaysInMonth = lastDayOfMonth.getDate();
      const totalCalendarDays = 42; // 6 rows of 7 days
      
      const days = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize today to start of day
      
      // Add previous month days
      const prevMonth = new Date(year, month, 0);
      const prevMonthTotalDays = prevMonth.getDate();
      
      for (let i = prevMonthTotalDays - daysFromPrevMonth + 1; i <= prevMonthTotalDays; i++) {
        const dayDate = new Date(year, month - 1, i);
        dayDate.setHours(0, 0, 0, 0); // Normalize to start of day
        days.push({
          dayNumber: i,
          date: dayDate,
          formattedDate: this.formatDateForComparison(dayDate),
          isCurrentMonth: false,
          isToday: this.isSameDay(dayDate, today),
          hasEvent: this.dayHasEvent(dayDate),
          events: this.getEventsForDay(dayDate)
        });
      }
      
      // Add current month days
      for (let i = 1; i <= totalDaysInMonth; i++) {
        const dayDate = new Date(year, month, i);
        dayDate.setHours(0, 0, 0, 0); // Normalize to start of day
        days.push({
          dayNumber: i,
          date: dayDate,
          formattedDate: this.formatDateForComparison(dayDate),
          isCurrentMonth: true,
          isToday: this.isSameDay(dayDate, today),
          hasEvent: this.dayHasEvent(dayDate),
          events: this.getEventsForDay(dayDate)
        });
      }
      
      // Add next month days to fill the grid
      const remainingDays = totalCalendarDays - days.length;
      for (let i = 1; i <= remainingDays; i++) {
        const dayDate = new Date(year, month + 1, i);
        dayDate.setHours(0, 0, 0, 0); // Normalize to start of day
        days.push({
          dayNumber: i,
          date: dayDate,
          formattedDate: this.formatDateForComparison(dayDate),
          isCurrentMonth: false,
          isToday: this.isSameDay(dayDate, today),
          hasEvent: this.dayHasEvent(dayDate),
          events: this.getEventsForDay(dayDate)
        });
      }
      
      return days;
    }
  },
  methods: {
    previousMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
      this.selectedDay = null;
    },
    nextMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
      this.selectedDay = null;
    },
    selectDay(day) {
      if (day.hasEvent) {
        this.selectedDay = day;
      } else {
        this.selectedDay = null;
      }
    },
    isSameDay(date1, date2) {
      return date1.getDate() === date2.getDate() && 
             date1.getMonth() === date2.getMonth() && 
             date1.getFullYear() === date2.getFullYear();
    },
    // Format date as YYYY-MM-DD without timezone issues
    formatDateForComparison(date) {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    },
    dayHasEvent(date) {
      return this.getEventsForDay(date).length > 0;
    },
    getEventsForDay(date) {
      const events = [];
      
      // Format the date as YYYY-MM-DD for consistent comparison
      const formattedDate = this.formatDateForComparison(date);
      
      // Add themes (start_date to end_date range)
      if (this.themes && this.themes.length > 0) {
        this.themes.forEach(theme => {
          if (!theme.start_date || !theme.end_date) return;
          
          // Create normalized date objects for comparison
          const startDateParts = theme.start_date.split('-').map(Number);
          const endDateParts = theme.end_date.split('-').map(Number);
          
          // Create local date objects (no timezone issues)
          const startDate = new Date(startDateParts[0], startDateParts[1] - 1, startDateParts[2]);
          const endDate = new Date(endDateParts[0], endDateParts[1] - 1, endDateParts[2]);
          
          // Normalize dates to beginning of day
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(0, 0, 0, 0);
          date.setHours(0, 0, 0, 0);
          
          // Check if the date falls within theme dates
          if (date >= startDate && date <= endDate) {
            events.push({
              id: theme.id,
              name: theme.name,
              description: theme.description,
              type: theme.theme_type === 'day' ? 'theme-day' : 'theme-week',
              entityType: 'theme'
            });
          }
        });
      }
      
      // Add special days (single day events)
      if (this.specialDays && this.specialDays.length > 0) {
        this.specialDays.forEach(specialDay => {
          if (!specialDay.date) return;
          
          // Direct string comparison of YYYY-MM-DD format
          if (formattedDate === specialDay.date) {
            events.push({
              id: specialDay.id,
              name: specialDay.name,
              description: specialDay.description,
              type: 'special-day',
              entityType: 'special-day'
            });
          }
        });
      }
      
      return events;
    },
    formatSelectedDay() {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      return this.selectedDay.date.toLocaleDateString('ro-RO', options);
    },
    getEventLink(event) {
      if (event.entityType === 'theme') {
        return `/themes/${event.id}`;
      } else if (event.entityType === 'special-day') {
        return `/special-day/${event.id}`;
      }
      return '/';
    }
  }
}
</script>

<style scoped>
.events-calendar {
  background-color: white;
  border-radius: 0;
  box-shadow: 0 10px 30px rgba(0,0,0,0.06);
  padding: 3rem;
  margin-bottom: 4rem;
  font-family: 'Cormorant Garamond', 'Playfair Display', serif;
}

.calendar-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
}

.current-month {
  font-size: 1.8rem;
  color: #333;
  font-weight: 300;
  letter-spacing: 1px;
}

.calendar-nav-btn {
  background-color: transparent;
  border: 1px solid #eee;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.calendar-nav-btn:hover {
  background-color: #f9f9f9;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
}

.nav-icon {
  font-size: 1.2rem;
  color: #333;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 2.5rem;
}

.calendar-weekday {
  text-align: center;
  font-weight: 600;
  padding: 0.8rem 0;
  color: #666;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-family: 'Montserrat', sans-serif;
}

.calendar-day {
  border: 1px solid #f5f5f5;
  min-height: 90px;
  padding: 0.8rem;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.calendar-day:hover {
  background-color: #f9f9f9;
  border-color: #eee;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.03);
}

.other-month {
  color: #bbb;
  background-color: #fafafa;
}

.day-number {
  font-weight: 400;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.has-event {
  border-color: #eee;
}

.today {
  background-color: #fffde7;
  border: 1px solid #e6e0b3;
}

.event-indicators {
  margin-top: auto;
  display: flex;
  gap: 3px;
  flex-wrap: wrap;
}

.event-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: transform 0.3s ease;
}

/* Different colors for different event types */
.event-dot.theme-week {
  background-color: #e74c3c; /* Red for theme weeks */
}

.event-dot.theme-day {
  background-color: #3498db; /* Blue for theme days */
}

.event-dot.special-day {
  background-color: #e67e22; /* Orange for special days */
}

.calendar-day:hover .event-dot {
  transform: scale(1.2);
}

.selected-day-events {
  margin-top: 3rem;
  border-top: 1px solid #eee;
  padding-top: 2rem;
  animation: fade-in 0.5s ease;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.selected-day-events h3 {
  font-size: 1.6rem;
  margin-bottom: 2rem;
  color: #333;
  font-weight: 300;
  letter-spacing: 0.5px;
  position: relative;
  padding-bottom: 1rem;
}

.selected-day-events h3::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 1px;
  background-color: #333;
}

.day-event {
  display: flex;
  padding: 1.5rem;
  background-color: #f9f9f9;
  border-radius: 0;
  margin-bottom: 1.2rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.day-event:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.05);
}

.event-type-indicator {
  width: 5px;
  margin-right: 1.5rem;
}

/* Different colors for different event types */
.event-type-indicator.theme-week {
  background-color: #e74c3c; /* Red for theme weeks */
}

.event-type-indicator.theme-day {
  background-color: #3498db; /* Blue for theme days */
}

.event-type-indicator.special-day {
  background-color: #e67e22; /* Orange for special days */
}

.event-details {
  flex: 1;
}

.event-details h4 {
  margin: 0 0 0.8rem;
  color: #333;
  font-size: 1.4rem;
  font-weight: 400;
}

.event-details p {
  margin: 0 0 1.2rem;
  color: #666;
  font-size: 0.95rem;
  font-family: 'Montserrat', sans-serif;
  font-weight: 300;
}

.view-event-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.7rem 1.2rem;
  background-color: transparent;
  color: #333;
  text-decoration: none;
  border: 1px solid #333;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  font-family: 'Montserrat', sans-serif;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.view-event-btn:hover {
  background-color: #333;
  color: white;
}

.btn-arrow {
  margin-left: 8px;
  transition: transform 0.3s ease;
}

.view-event-btn:hover .btn-arrow {
  transform: translateX(4px);
}

@media (max-width: 992px) {
  .events-calendar {
    padding: 2.5rem;
  }
  
  .calendar-day {
    min-height: 80px;
    padding: 0.6rem;
  }
}

@media (max-width: 768px) {
  .events-calendar {
    padding: 2rem 1.5rem;
  }
  
  .calendar-day {
    min-height: 70px;
    padding: 0.5rem;
  }
  
  .calendar-weekday {
    font-size: 0.8rem;
  }
  
  .day-number {
    font-size: 1rem;
  }
  
  .selected-day-events h3 {
    font-size: 1.4rem;
  }
  
  .event-details h4 {
    font-size: 1.2rem;
  }
}

@media (max-width: 576px) {
  .events-calendar {
    padding: 1.5rem 1rem;
  }
  
  .calendar-controls {
    margin-bottom: 1.5rem;
  }
  
  .current-month {
    font-size: 1.4rem;
  }
  
  .calendar-weekday {
    padding: 0.5rem 0;
    font-size: 0.7rem;
  }
  
  .calendar-day {
    min-height: 60px;
    padding: 0.4rem;
  }
  
  .day-number {
    font-size: 0.9rem;
  }
  
  .event-dot {
    width: 6px;
    height: 6px;
  }
  
  .selected-day-events h3 {
    font-size: 1.3rem;
  }
  
  .day-event {
    padding: 1rem;
    margin-bottom: 1rem;
  }
  
  .event-type-indicator {
    margin-right: 1rem;
  }
  
  .event-details h4 {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
  }
  
  .event-details p {
    font-size: 0.85rem;
    margin-bottom: 1rem;
  }
  
  .view-event-btn {
    padding: 0.6rem 1rem;
    font-size: 0.8rem;
  }
}
</style>