<script>
  import { get } from 'svelte/store'
  import { selectedDays, starting, velocity, plannedPto } from './calendar/store.js'
  import { weeksBetweenDates } from '../lib/DateMath.js'

  let today = new Date();
  let nextYear = new Date(today.getFullYear() + 1, 0, 1);
  $: gainedPto = weeksBetweenDates(today, nextYear) * $velocity;
  $: predicted = Math.floor($starting + gainedPto - $plannedPto);
</script>

<style>
.container {
  display: inline-grid;
  grid-template-columns: repeat(2, 1fr);
  align-items: center;
  grid-gap: 5px;
}
</style>

<div class='container'>
  <span>Weekly Accrual Rate</span> 
  <span>Starting PTO (hours):</span>
  <input type=number step=0.0001 bind:value={$velocity} min=0>
  <input type=number bind:value={$starting} min=0>
  <span>Planned PTO (hours):</span>
  <span>End of Year Balance (hours):</span>
  <span>{$plannedPto}</span>
  <span>{predicted}</span>
</div>
