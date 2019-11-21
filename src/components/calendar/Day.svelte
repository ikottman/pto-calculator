<script>
  import { selectedDays } from './store.js'
  import { get } from 'svelte/store'

  export let fillColor = "white";
  export let label;
  export let date;

  function onClick() {
    if (date) {
      selectedDays.update(existing => [...existing, date]);
    }
  }

  $: selected = date ? $selectedDays.some(selectedDay => selectedDay.getTime() === date.getTime()) : false;
  let style = `background-color: ${fillColor}; width: 1.2rem; height: 1.2rem; text-align: center;`;
</script>

<style>
  .selected {
    border: 0.2rem solid #7de574;
  }
</style>

<div {style} class:selected on:click={onClick}>{label}</div>