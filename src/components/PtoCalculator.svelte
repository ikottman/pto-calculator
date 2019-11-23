<script>
  import { selectedDays } from './calendar/store.js'
  import { get } from 'svelte/store'

  function isSunday(date) {
    return date.getDay() === 0;
  }

  function incrementDay(date) {
    date.setDate(date.getDate() + 1);
  }

  function weeksBetweenDates(start, end) {
    let date = new Date(start.getTime());
    let numSundays = 0;
    do {
      incrementDay(date);
      if (isSunday(date)) { 
        numSundays++; 
      }
    } while (date.getTime() < end.getTime())

    return numSundays;
  }

  let starting = 0;
  let velocity = 0;
  let today = new Date();
  let nextYear = new Date(today.getFullYear() + 1, 0, 1);
  $: plannedPto = $selectedDays.length * 8;
  $: gainedPto = weeksBetweenDates(today, nextYear) * velocity;
  $: predicted = Math.floor(starting + gainedPto - plannedPto );
</script>

<style>
.container {
  display: inline-grid;
  grid-template-columns: repeat(2, 1fr);
  align-items: center;
  grid-gap: 5px;
}

.row {
  height: 1rem;
}
</style>

<div class='container'>
  <span>Weekly Accrual Rate</span> 
  <span>Starting PTO (hours):</span>
  <input type=number step=0.0001 bind:value={velocity} min=0>
  <input type=number bind:value={starting} min=0>
  <span>Planned PTO (hours):</span>
  <span>End of Year Balance (hours):</span>
  <span>{$selectedDays.length}</span>
  <span>{predicted}</span>
</div>
