<script>
  import { selectedDays, starting, velocity } from './store.js';
  import { weeksBetweenDates } from '../../lib/DateMath.js';
  import Circle from './Circle.svelte';
  import { get } from 'svelte/store';
  export let date;

  function onClick() {
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
  let isToday = today.getDate() == date.getDate() && today.getMonth() == date.getMonth();
  $: selected = date ? $selectedDays.some(selectedDay => selectedDay.getTime() === date.getTime()) : false;
  $: if (date) {
    let gainedPto = weeksBetweenDates(today, date) * $velocity;
    let plannedUntilToday = $selectedDays.filter(d => d < date).length * 8;
    predicted = Math.floor($starting + gainedPto - plannedUntilToday);
  }
</script>

<Circle
  title={predicted}
  {onClick}
  {selected}
  selectable=true
  hoverable={!selected}
  bold={isToday}
>
  <slot/>
</Circle>