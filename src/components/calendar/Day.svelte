<script>
  import { selectedDays, starting, velocity, plannedPto } from './store.js'
  import { weeksBetweenDates } from '../../lib/DateMath.js'
  import { get } from 'svelte/store'
  export let label;
  export let date;

  function onClick() {
    if (!date) { return; }

    if ($selectedDays.includes(date)) {
      // unselect
      selectedDays.update(existing => $selectedDays.filter(d => d !== date));
    } else {
      // select
      selectedDays.update(existing => [...existing, date]);
    }
  }

  let today = new Date();
  let predicted = 0;
  $: selected = date ? $selectedDays.some(selectedDay => selectedDay.getTime() === date.getTime()) : false;
  $: unselected = !selected;
  $: if (date) {
    let gainedPto = weeksBetweenDates(today, date) * $velocity;
    predicted = Math.floor($starting + gainedPto - $plannedPto);
  }

  let id = !!date ? "day" : "header";
</script>

<style>
  div {
    user-select: none;
  }

  #header {
    font-weight: bold;
  }

  #day {
    text-align: center;
    border-radius: 50%;
    width: 1.2rem;
    height: 1.2rem;
    line-height: 1.2rem;
    padding: 3px;
    transition: background-color 100ms linear;
    cursor: pointer;
  }

  #day.unselected:hover {
    background-color: #d2e3fc;
    color: black;
  }

  #day.selected {
    background-color: #1a73e8;
    color: white;
  }

  #day.unselected {
    background-color: white;
    color: black;
  }
</style>

<div title="{predicted}" {id} class:selected class:unselected on:click={onClick}>{label}</div>