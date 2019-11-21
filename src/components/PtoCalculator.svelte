<script>
  import { selectedDays } from './calendar/store.js'
  import { get } from 'svelte/store'
</script>



<p>Days taken off: {$selectedDays.length}</p>