<script>
  import Day from './Day.svelte';
  export let name;
  export let days;
  export let firstDay;
  export let date;

  function day(month, dayNum) {
    const date = new Date(month.getFullYear(), month.getMonth(), dayNum);
    return {
      label: dayNum,
      date: date
    }
  }

  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let dayIndex = weekdays.findIndex(d => d === firstDay);
  const fillerDay = {
      label: ''
    };
  let week = Array(dayIndex).fill(fillerDay);
  const header = weekdays.map(day => {return {label: day[0]} });
  const month = [header];
  for (let i = 1; i <= days; i++) {
    week.push(day(date, i));

    // start over when we hit saturday
    if (dayIndex == 6 || i == days) {
      dayIndex = 0;
      month.push(week);
      week = [];
    } else {
      dayIndex++;
    }
  }
</script>

<style>
.container {
  display: inline-grid;
  grid-template-columns: repeat(7, 1fr);
  grid-gap: 4px;
  justify-items: center;
}

h2 {
  grid-column: 1 / 8;
}
</style>

<div class="container">
  <h2>{name}</h2>
  {#each month as week}
      {#each week as day}
        <Day label={day.label} date={day.date}/>
      {/each}
  {/each}
</div>
