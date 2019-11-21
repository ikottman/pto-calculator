<script>
  import Month from './Month.svelte';

  // expand Date object for easier formatting
  Date.prototype.daysInMonth = function() {
    let date = new Date(this.getFullYear(), this.getMonth() + 1, 0);
    return date.getDate();
  };

  Date.prototype.getFullMonth = function() {
    return this.toLocaleString('default', { month: 'long' });
  };

  Date.prototype.getFullDay = function() {
    return this.toLocaleString('default', { weekday: 'long' });
  };

  // get the first day of each month of the current year
  const currentYear = new Date().getFullYear();
  const dates = Array(12).fill(0).map((_, index) => new Date(currentYear, index));
</script>

<style>
  .container {
    display: inline-grid;
    grid-template-columns: repeat(4, 1fr);
    grid-gap: 20px;
    justify-items: center;
  }
</style>

<div class='container'>
  {#each dates as month}
    <Month name={month.getFullMonth()} days={month.daysInMonth()} firstDay={month.getFullDay()} date={month}/>
  {/each}
</div>