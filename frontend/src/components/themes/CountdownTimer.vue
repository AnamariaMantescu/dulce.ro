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
  padding: 1.5rem;
  text-align: center;
  font-family: 'Cormorant Garamond', 'Playfair Display', serif;
  background-color: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(5px);
  border-radius: 8px;
  max-width: 600px;
  margin: 0 auto;
}

.countdown-title {
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
  font-weight: 400;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  font-family: 'Montserrat', sans-serif;
}

.countdown-timer {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;
}

.time-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 5px;
}

.time-value {
  font-size: 2.2rem;
  font-weight: 400;
  padding: 0.5rem 0;
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  color: black;
}



.time-label {
  margin-top: 0.6rem;
  font-size: 0.8rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  font-weight: 400;
  font-family: 'Montserrat', sans-serif;
}

.time-separator {
  font-size: 2rem;
  font-weight: 300;
  margin: 0 4px;
  padding-bottom: 25px;
  opacity: 0.8;
}

/* Keep timer inline at all sizes but adjust dimensions */
@media (max-width: 768px) {
  .countdown-container {
    padding: 1.2rem;
  }
  
  .time-value {
    font-size: 1.8rem;
    width: 60px;
    height: 60px;
  }
  
  .time-separator {
    font-size: 1.8rem;
    margin: 0 2px;
    padding-bottom: 20px;
  }
  
  .countdown-title {
    font-size: 1.1rem;
    margin-bottom: 1.2rem;
  }
  
  .time-label {
    font-size: 0.75rem;
  }
}

@media (max-width: 576px) {
  .countdown-container {
    padding: 1rem;
  }
  
  .time-value {
    font-size: 1.5rem;
    width: 50px;
    height: 50px;
  }
  
  .time-block {
    padding: 0 2px;
  }
  
  .time-separator {
    font-size: 1.5rem;
    margin: 0 1px;
    padding-bottom: 16px;
  }
  
  .time-label {
    font-size: 0.7rem;
    margin-top: 0.4rem;
  }
  
  .countdown-title {
    font-size: 1rem;
    margin-bottom: 1rem;
  }
}

@media (max-width: 400px) {
  .time-value {
    font-size: 1.2rem;
    width: 40px;
    height: 40px;
  }
  
  .time-label {
    font-size: 0.6rem;
  }
  
  .time-separator {
    font-size: 1.2rem;
    padding-bottom: 12px;
  }
}
</style>