<template>
  <div class="countdown-container">
    <h3 class="countdown-title">{{ title }}</h3>
    <div class="countdown-timer">
      <div class="time-block">
        <div class="time-value">{{ days }}</div>
        <div class="time-label">Zile</div>
      </div>
      <div class="time-separator">:</div>
      <div class="time-block">
        <div class="time-value">{{ hours }}</div>
        <div class="time-label">Ore</div>
      </div>
      <div class="time-separator">:</div>
      <div class="time-block">
        <div class="time-value">{{ minutes }}</div>
        <div class="time-label">Minute</div>
      </div>
      <div class="time-separator">:</div>
      <div class="time-block">
        <div class="time-value">{{ seconds }}</div>
        <div class="time-label">Secunde</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CountdownTimer',
  props: {
    targetDate: {
      type: [Date, String],
      required: true
    },
    title: {
      type: String,
      default: 'Începe în:'
    }
  },
  data() {
    return {
      days: '00',
      hours: '00',
      minutes: '00',
      seconds: '00',
      interval: null
    };
  },
  methods: {
    calculateTimeLeft() {
      const targetTime = new Date(this.targetDate).getTime();
      const now = new Date().getTime();
      const difference = targetTime - now;
      
      if (difference <= 0) {
        this.days = '00';
        this.hours = '00';
        this.minutes = '00';
        this.seconds = '00';
        clearInterval(this.interval);
        this.$emit('countdown-finished');
        return;
      }
      
      // Calculate time units
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      // Add leading zeros
      this.days = days < 10 ? `0${days}` : days.toString();
      this.hours = hours < 10 ? `0${hours}` : hours.toString();
      this.minutes = minutes < 10 ? `0${minutes}` : minutes.toString();
      this.seconds = seconds < 10 ? `0${seconds}` : seconds.toString();
    }
  },
  mounted() {
    this.calculateTimeLeft();
    this.interval = setInterval(this.calculateTimeLeft, 1000);
  },
  beforeUnmount() {
    clearInterval(this.interval);
  }
}
</script>

<style scoped>
.countdown-container {
  padding: 2.5rem;
  text-align: center;
  font-family: 'Cormorant Garamond', 'Playfair Display', serif;
}

.countdown-title {
  margin-bottom: 2rem;
  font-size: 1.4rem;
  /* color: #333; */
  font-weight: 300;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-family: 'Montserrat', sans-serif;
}

.countdown-timer {
  display: flex;
  justify-content: center;
  align-items: center;
}

.time-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
}

.time-value {
  font-size: 2.4rem;
  font-weight: 300;
  color: #333;
  padding: 0.8rem 0;
  width: 80px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  position: relative;
  background-color: white;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}

.time-value::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(0, 0, 0, 0.1), transparent);
}

.time-block:hover .time-value {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.time-label {
  margin-top: 0.8rem;
  font-size: 0.9rem;
  /* color: #666; */
  letter-spacing: 1px;
  text-transform: uppercase;
  font-weight: 300;
  font-family: 'Montserrat', sans-serif;
}

.time-separator {
  font-size: 2.4rem;
  font-weight: 300;
  margin: 0 0.8rem;
  color: #333;
  padding-bottom: 30px;
}

@media (max-width: 768px) {
  .time-value {
    font-size: 2rem;
    width: 70px;
  }
  
  .time-block {
    min-width: 70px;
  }
  
  .time-separator {
    font-size: 2rem;
    margin: 0 0.4rem;
  }
  
  .countdown-title {
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .countdown-timer {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
  
  .time-block {
    margin: 0;
  }
  
  .time-separator {
    display: none;
  }
  
  .countdown-container {
    padding: 2rem 1rem;
  }
}
</style>