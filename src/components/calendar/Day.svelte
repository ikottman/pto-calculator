<script>
  import { selectedDays } from './store.js'
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

  let id = !!date ? "day" : "header";
  $: selected = date ? $selectedDays.some(selectedDay => selectedDay.getTime() === date.getTime()) : false;
  $: unselected = !selected;
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

<div {id} class:selected class:unselected on:click={onClick}>{label}</div>