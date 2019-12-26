<script>
  export let title = '';
  export let onClick = null;
  export let bold = false;
  export let selectable = false;
  export let selected = false;
  export let hoverable = false;
</script>

<style>
  .bold {
    font-weight: bold;
  }

  div {
    user-select: none;
    text-align: center;
    border-radius: 50%;
    width: 1.2rem;
    height: 1.2rem;
    line-height: 1.2rem;
    padding: 3px;
  }

  .hoverable {
    transition: background-color 100ms linear;
  }

  .hoverable:hover {
    background-color: #d2e3fc;
    color: black;
  }

  .selectable {
    cursor: pointer;
  }

  .selected {
    background-color: #1a73e8;
    color: white;
  }
</style>

<div title="{title}"
  on:click={onClick}
  class:bold
  class:selectable
  class:selected
  class:hoverable
>
  <slot/>
</div>