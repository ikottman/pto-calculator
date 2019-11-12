<script>
  import Rectangle from './Rectangle.svelte';
  export let name;
  export let days;
  export let firstDay;

  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  let week = [];
  let month = [];
  let dayIndex = weekdays.findIndex(d => d === firstDay);
  for (let i = 1; i <= days; i++) {
    week.push({
      name: weekdays[dayIndex],
      number: i
    });
    
    if (dayIndex == 6 || i == days) {
      dayIndex = 0;
      month.push(week);
      week = [];
    } else {
      dayIndex++;
    }
  }
  console.log(month);
</script>

<style>
.container {
  display: inline-grid;
  grid-template-columns: repeat(7, 1fr);
  grid-gap: 2px;
}

</style>

<h2>{name}</h2>
<div class="container">
  {#each month as week}
      {#each week as day}
        <Rectangle width=20 height=20 label={day.number}/>
      {/each}
  {/each}
</div>