<script>
  import { selectedDays, starting, velocity, plannedPto } from './store.js';
  import { weeksBetweenDates } from '../../lib/DateMath.js';
  import Circle from './Circle.svelte';
  import { get } from 'svelte/store';
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
  $: if (date) {
    let gainedPto = weeksBetweenDates(today, date) * $velocity;
    predicted = Math.floor($starting + gainedPto - $plannedPto);
  }
</script>

<Circle
  title={predicted}
  {onClick}
  {selected}
  selectable=true
  hoverable={!selected}
>
  <slot/>
</Circle>